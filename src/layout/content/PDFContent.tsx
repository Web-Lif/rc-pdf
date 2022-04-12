import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { css } from '@emotion/css'
import { notification } from '@weblif/fast-ui'
import { Document, Page, pdfjs } from 'react-pdf'
import { PDFDocument, rgb, translate } from 'pdf-lib'
import { Stage, Layer } from 'react-konva'
import hexRgb from 'hex-rgb'
import fontkit from "@pdf-lib/fontkit";

import { EditType, isDelLineShape, isRectangleShape, isTextShape, MSPosition, PDFContentHandle, Shape } from '../types'
import { emitMouseEvent, emitRenderShapeEvent } from './register'

pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;

interface PDFContentProps {

    current: number

    pdf?: React.MutableRefObject<PDFContentHandle>

    /** 编辑信息 */
    edit: EditType

    /** 要编辑的 PDF 数据 */
    data?: ArrayBuffer

    /** 缩放比例 */
    scale?: number

    onChangeTotal?: (val: number) => void
}

const getPdfColor = (color: string) => {
    const shapeRgb = hexRgb(color)
    return rgb(shapeRgb.red / 255, shapeRgb.green / 255, shapeRgb.blue / 255)
}

const PDFContent = ({
    data,
    scale = 1,
    edit,
    current,
    pdf,
    onChangeTotal
}: PDFContentProps) => {
    const { selectBox, color } = edit
    const [shapes, setShapes] = useState<Shape[]>([])

    const [size, setSize] = useState<{
        width: number
        height: number
    }>()

    const pdfRef = useRef<HTMLCanvasElement>(null)
    const pdfDoc = useRef<PDFDocument>()
    const mouseDownPosition = useRef<MSPosition>({
        y: -1,
        x: -1
    })

    let fontBytes = useRef<ArrayBuffer>()

    const drawShapeToPdf = async () => {
        const pageShapes: Shape[][] = []
        shapes.forEach(ele => {
            if (pageShapes[ele.pageNo - 1]) {
                pageShapes[ele.pageNo - 1].push(ele)
            } else {
                pageShapes[ele.pageNo - 1] = [ele]
            }
        })

        for (let i = 0; i < pageShapes.length; i += 1) {
            const shapes = pageShapes[i]
            const page = pdfDoc.current?.getPage(i)
            const height = page!.getHeight()
            page?.pushOperators(translate(0, height))
            for (let shapeIndex = 0; shapeIndex < shapes.length; shapeIndex += 1) {
                const shape = shapes[shapeIndex]

                if (isTextShape(shape)) {
                    if (!fontBytes.current) {
                        pdfDoc.current?.registerFontkit(fontkit)
                        fontBytes.current = await fetch('/fonts/WenQuanYiZenHeiMono-02.ttf').then((res) => res.arrayBuffer());
                    }

                    const helveticaFont = await pdfDoc.current?.embedFont(fontBytes.current!);
                    page?.drawText(shape.text, {
                        color: getPdfColor(shape.color),
                        size: shape.size,
                        x: shape.position.x,
                        y: -shape.position.y,
                        font: helveticaFont,
                    })
                } else if (isRectangleShape(shape)) {
                    page?.drawRectangle({
                        x: shape.position.x,
                        y: -(shape.position.y + shape.height),
                        width: shape.width,
                        height: shape.height,
                        borderColor: getPdfColor(shape.color),
                        borderWidth: 1.5
                    })
                } else if (isDelLineShape(shape)) {
                    console.log('drawLine')
                    page?.drawLine({
                        start: {
                            x: shape.position.x,
                            y: -shape.position.y,
                        },
                        end: {
                            x: shape.end.x,
                            y: -shape.position.y,
                        },
                        color: getPdfColor(shape.color)
                    })
                }
            }
        }
    }

    if (pdf) {
        pdf.current = {
            getPDFToBase64Url: async (param) => {
                await drawShapeToPdf()
                const data = await pdfDoc.current?.saveAsBase64({
                    dataUri: param?.dataUrl === false ? false : true
                })
                return data!;
            },
            getPDFToArrayBuffer: async () => {
                await drawShapeToPdf()
                const data = await pdfDoc.current?.save()
                return data!
            }
        }
    }

    useEffect(() => {
        (async () => {
            if (data) {
                pdfDoc.current = await PDFDocument.load(data)
            }
        })()
    }, [data, current])

    const isLoadPage = useRef<boolean>(false)

    const htmlEdit: ReactNode[] = []

    const getCursor = () => {
        if (edit.selectBox === 'text') {
            return 'cursor: text;'
        }
        return '';
    }

    const renderShapes = () => {
        return shapes.filter(shape => shape.pageNo === current).map((shape) => {
            return emitRenderShapeEvent({
                shapes,
                setShapes,
                color,
                pageNo: current,
                edit,
                currentShape: shape,
                htmlEdit
            })
        })
    }

    return (
        <div
            className={css`
                display: flex;
                width: ${size?.width}px;
                height: ${size?.height}px;
                flex-direction: column;
                margin: 1rem auto;
            `}
        >
            <Document
                file={data}
                onLoadSuccess={(event) => {
                    onChangeTotal?.(event.numPages)
                }}
                onLoadError={(e) => {
                    notification.warning({
                        message: "系统消息",
                        description: '加载编辑器失败, 错误信息见控制台...'
                    })
                    console.error(e)
                }}
                options={{
                    cMapUrl: 'cmaps/',
                    cMapPacked: true,
                    standardFontDataUrl: 'standard_fonts/',
                }}
            >
                <div
                    className={css`
                        position: relative;
                    `}
                >
                    <Page
                        canvasRef={pdfRef}
                        pageNumber={current}
                        height={(size?.height || 0) * scale}
                        width={(size?.width || 0) * scale}
                        onLoadSuccess={(page) => {
                            if (page.pageNumber === 1 && !isLoadPage.current) {
                                setSize({
                                    height: page.height,
                                    width: page.width
                                })
                                isLoadPage.current = true

                            }
                        }}
                    />
                    <div
                        className={css`
                            position: absolute;
                            top: 0;
                            z-index: 1;
                            ${getCursor()}
                        `}
                    >
                        <Stage
                            id="$stage"
                            height={pdfRef.current?.offsetHeight || 0}
                            width={pdfRef.current?.offsetWidth || 0}
                            onMouseDown={(e) => {
                                const { x, y } = e.currentTarget.getStage()!.getPointerPosition()!
                                mouseDownPosition.current = {
                                    x,
                                    y
                                }
                                emitMouseEvent('MouseDown', {
                                    setShapes,
                                    shapes,
                                    selectBox,
                                    event: e,
                                    edit,
                                    pageNo: current,
                                    color,
                                    mouseDownPosition: mouseDownPosition.current
                                })
                            }}
                            onMouseMove={e => {
                                emitMouseEvent('MouseMove', {
                                    setShapes,
                                    shapes,
                                    selectBox,
                                    event: e,
                                    edit,
                                    pageNo: current,
                                    color,
                                    mouseDownPosition: mouseDownPosition.current
                                })
                            }}
                            onMouseUp={(e) => {
                                emitMouseEvent('MouseUp', {
                                    setShapes,
                                    shapes,
                                    selectBox,
                                    event: e,
                                    edit,
                                    pageNo: current,
                                    color,
                                    mouseDownPosition: mouseDownPosition.current
                                })
                            }}
                        >
                            <Layer>
                                {renderShapes()}
                            </Layer>
                        </Stage>
                        {htmlEdit}
                    </div>
                </div>
            </Document>
            <div
                className={css`
                    flex: 1;
                `}
            >
            </div>
        </div>
    )
}

export default PDFContent
