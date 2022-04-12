import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { css } from '@emotion/css'
import { notification } from '@weblif/fast-ui'
import { Document, Page, pdfjs } from 'react-pdf'
import { PDFDocument, rgb, translate } from 'pdf-lib'
import { Stage, Layer } from 'react-konva'
import { produce } from 'immer'
import { nanoid } from 'nanoid'
import hexRgb from 'hex-rgb'
import fontkit from "@pdf-lib/fontkit";

import { DelLineShape, EditType, isDelLineShape, isRectangleShape, isTextShape, MSPosition, PDFContentHandle, RectangleShape, Shape, TextShape } from '../types'
import TextEdit from './edit/TextEdit'
import RectangleEdit from './edit/RectangleEdit'
import DelLineEdit from './edit/DelLineEdit'

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
                    page?.drawLine({
                        start: {
                            x: shape.position.x,
                            y: -shape.position.y,
                        },
                        end: {
                            x: shape.end.x,
                            y: -shape.end.y,
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
            } else if (isDelLineShape(shape)) {
                return (
                    <DelLineEdit
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
                                } else if (selectBox === 'delLine') {
                                    const newShapes = produce(shapes, (draft) => {
                                        const rectangShape: DelLineShape = {
                                            id: nanoid(),
                                            color,
                                            position: {
                                                x,
                                                y
                                            },
                                            end: {
                                                x,
                                                y
                                            },
                                            type: 'delLine',
                                            state: 'new',
                                            pageNo: current,
                                        }
                                        draft.push(rectangShape)
                                    })
                                    setShapes(newShapes)
                                }
                            }}
                            onMouseMove={e => {
                                const { x, y } = e.currentTarget.getStage()!.getPointerPosition()!
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
                                } else if (selectBox === 'delLine') {
                                    const newShapes = produce(shapes, (draft) => {
                                        draft.some(ele => {
                                            if (ele.state === 'new' && isDelLineShape(ele)) {
                                                ele.end = {
                                                    x,
                                                    y
                                                }
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
                                    } else if (selectBox === 'delLine') {
                                        const newShapes = produce(shapes, (draft) => {
                                            draft.some(ele => {
                                                if (ele.state === 'new' && isDelLineShape(ele)) {
                                                    ele.end = {
                                                        x,
                                                        y
                                                    }
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
