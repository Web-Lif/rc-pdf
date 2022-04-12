import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { css } from '@emotion/css'
import { notification } from '@weblif/fast-ui'
import { Document, Page, pdfjs } from 'react-pdf'
import { PDFDocument, rgb } from 'pdf-lib'
import { Stage, Layer } from 'react-konva'
import { produce } from 'immer'
import { nanoid } from 'nanoid'
import hexRgb from 'hex-rgb'

import { EditType, isRectangleShape, isTextShape, MSPosition, RectangleShape, Shape, TextShape } from '../types'
import TextEdit from './edit/TextEdit'
import RectangleEdit from './edit/RectangleEdit'

pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;

interface PDFContentHandle {
    getPDFToBase64Url: () => Promise<string>
}


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

    const drawShapeToPdf = async () => {
        for (let i = 0; i < shapes.length; i += 1) {
            const shape = shapes[i]
            const page = pdfDoc.current?.getPage(shape.pageNo)
            if (isTextShape(shape)) {
                const shapeRgb = hexRgb(shape.color)
                page?.drawText(shape.text, {
                    color: rgb(shapeRgb.red, shapeRgb.green, shapeRgb.blue),
                    size: shape.size
                })
            }
        }
    }

    if (pdf) {
        pdf.current = {
            getPDFToBase64Url: async () => {
                await drawShapeToPdf()
                const data = await pdfDoc.current?.saveAsBase64()
                return data!;
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
            if (isTextShape(shape)) {
                const edit = (
                    <TextEdit
                        size={shape.size}
                        shape={shape}
                        key={nanoid()}
                        onClick={() => {
                            const newShapes = produce(shapes, (draft) => {
                                const eleIndex = draft.findIndex(ele => ele.id === shape.id)
                                const selectShape = draft[eleIndex]
                                if (isTextShape(selectShape)) {
                                    selectShape.state = 'edit'
                                }
                            })
                            setShapes(newShapes)
                        }}

                        fill={shape.color}
                        onChange={(text) => {
                            const newShapes = produce(shapes, (draft) => {
                                const eleIndex = draft.findIndex(ele => ele.id === shape.id)
                                const selectShape = draft[eleIndex]
                                if (text !== '' && eleIndex > -1 && isTextShape(selectShape)) {
                                    selectShape.state = 'normal'
                                    selectShape.text = text
                                } else {
                                    draft.splice(eleIndex, 1)
                                }
                            })
                            setShapes(newShapes)
                        }}
                    />
                )
                if (shape.state === 'new' || shape.state === 'edit') {
                    htmlEdit.push(edit)
                    return null
                }
                return edit
            } else if (isRectangleShape(shape)) {
                return (
                    <RectangleEdit
                        shape={shape}
                        key={nanoid()}
                        onClick={() => {
                            const newShapes = produce(shapes, (draft) => {
                                const eleIndex = draft.findIndex(ele => ele.id === shape.id)
                                const selectShape = draft[eleIndex]
                                if (isTextShape(selectShape)) {
                                    selectShape.state = 'edit'
                                }
                            })
                            setShapes(newShapes)
                        }}
                        fill={shape.color}
                        onChange={(text) => {
                            const newShapes = produce(shapes, (draft) => {
                                const eleIndex = draft.findIndex(ele => ele.id === shape.id)
                                const selectShape = draft[eleIndex]
                                if (text !== '' && eleIndex > -1 && isTextShape(selectShape)) {
                                    selectShape.state = 'normal'
                                    selectShape.text = text
                                } else {
                                    draft.splice(eleIndex, 1)
                                }
                            })
                            setShapes(newShapes)
                        }}
                    />
                )
            }
            return null
        })
    }

    return (
        <div
            className={css`
                display: flex;
                width: ${size?.width}px;
                height: ${size?.height}px;
                flex-direction: column;
            `}
        >
            <Document
                file={data}
                onLoadSuccess={(event) => {
                    console.log(event.numPages)
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
                        margin: 0px 0px 1rem 0px;
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
                                if (selectBox === 'rectangle') {
                                    const newShapes = produce(shapes, (draft) => {
                                        const rectangShape: RectangleShape = {
                                            id: nanoid(),
                                            color,
                                            position: {
                                                x,
                                                y
                                            },
                                            type: 'rectangle',
                                            state: 'new',
                                            width: 0,
                                            height: 0,
                                            pageNo: current
                                        }
                                        draft.push(rectangShape)
                                    })
                                    setShapes(newShapes)
                                }
                            }}
                            onMouseMove={e => {
                                const { x, y } = e.currentTarget.getStage()!.getPointerPosition()!
                                console.log(x, y)
                                if (selectBox === 'rectangle') {
                                    const newShapes = produce(shapes, (draft) => {
                                        draft.some(ele => {
                                            if (ele.state === 'new' && isRectangleShape(ele)) {
                                                ele.width = Math.abs(mouseDownPosition.current.x - x),
                                                ele.height = Math.abs(mouseDownPosition.current.y - y)
                                                ele.state = 'new'
                                                return true
                                            }
                                            return false
                                        })
                                    })
                                    setShapes(newShapes)
                                }
                            }}
                            onMouseUp={(e) => {
                                const { x, y } = e.currentTarget.getStage()!.getPointerPosition()!
                                if (e.currentTarget.id() === '$stage') {
                                    if (selectBox === 'text') {
                                        const newShapes = produce(shapes, (draft) => {
                                            const textShape: TextShape = {
                                                id: nanoid(),
                                                state: 'new',
                                                color,
                                                position: {
                                                    x,
                                                    y
                                                },
                                                type: 'text',
                                                text: '',
                                                pageNo: current,
                                                size: 18
                                            }
                                            draft.push(textShape)
                                        })
                                        setShapes(newShapes)
                                    } else if (selectBox === 'rectangle') {
                                        const newShapes = produce(shapes, (draft) => {
                                            draft.some(ele => {
                                                if (ele.state === 'new' && isRectangleShape(ele)) {
                                                    ele.width = Math.abs(mouseDownPosition.current.x - x)
                                                    ele.height = Math.abs(mouseDownPosition.current.y - y)
                                                    ele.state = 'normal'
                                                }
                                            })
                                        })
                                        setShapes(newShapes)
                                    }
                                }
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
