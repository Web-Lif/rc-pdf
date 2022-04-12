import React, { useState } from 'react'
import { Text } from 'react-konva'
import { Input } from '@weblif/fast-ui'
import { isTextShape, TextShape } from '@/layout/types'
import { css } from '@emotion/css'
import Konva from 'konva'
import { registerMouseEvent, registerRenderShapeEvent } from '../register'
import { nanoid } from 'nanoid'
import produce from 'immer'



export const registerComponent = () => {
    registerMouseEvent({
        name: 'MouseUp',
        selectBox: 'text',
        onTriggerEvent: ({
            event,
            shapes,
            color,
            pageNo,
            setShapes
        }) => {
            const { x, y } = event.currentTarget.getStage()!.getPointerPosition()!
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
                    pageNo,
                    size: 18
                }
                draft.push(textShape)
            })
            setShapes(newShapes)
        }
    })

    registerRenderShapeEvent({
        name: 'text',
        onRenderShapeEvent: ({
            currentShape,
            shapes,
            setShapes,
            htmlEdit
        }) => {
            const shape = currentShape as TextShape
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
        }
    })
}

interface TextEditProps {
    size: number
    shape: TextShape
    fill?: string
    onChange: (value: string) => void
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void
}

const TextEdit = ({
    size = 20,
    shape,
    fill,
    onChange,
    onClick
}: TextEditProps) => {
    const [value, setValue] = useState<string>(shape.text)

    if (shape.state === 'normal') {
        return (
            <Text
                text={shape.text}
                x={shape.position.x}
                y={shape.position.y}
                fontSize={size}
                draggable
                onClick={(e) => {
                    onClick?.(e)
                    e.cancelBubble = true
                }}
                fill={fill}
            />
        )
    }
    return (
        <Input
            className={css`
                position: absolute;
                width: 220px;
                font-size: ${size}px;
                left: ${shape.position.x}px;
                top: ${shape.position.y}px;
                padding: 0px;
            `}
            autoFocus
            value={value}
            onChange={(data) => {
                setValue(data)
            }}
            bordered={false}
            onBlur={() => {
                onChange?.(value)
            }}
            onKeyDown={(e) => {
                if (e.key === 'Escape' || e.key === 'Enter' ) {
                    onChange?.(value)
                }
            }}
        />
    )
}

export default TextEdit
