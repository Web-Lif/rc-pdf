import produce from 'immer'
import Konva from 'konva'
import { nanoid } from 'nanoid'
import React from 'react'
import { Line } from 'react-konva'
import { DelLineShape, isDelLineShape } from '../../types'
import { registerMouseEvent, registerRenderShapeEvent, RenderShapeEventParam, TriggerEventParam } from '../register'

interface RectangleEditProps {
    height?: number
    shape: DelLineShape
    fill?: string
    onChange?: (value: string) => void
    onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void
}

/** 矩形编辑器, 用来编辑和改变文件信息*/
const DelLineEdit = ({
    shape,
    fill
}: RectangleEditProps) => {
    const points = [0, 0]
    if (shape.end) {
        points.push(shape.end.x - shape.position.x)
        points.push(0)
    }
    return (
        <Line
            x={shape.position.x}
            y={shape.position.y}
            points={points}
            stroke={fill}
        />
    )
}

const onMouseDown = ({
    event,
    shapes,
    color,
    pageNo,
    setShapes
}: TriggerEventParam) => {
    const { x, y } = event.currentTarget.getStage()!.getPointerPosition()!
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
            pageNo,
        }
        draft.push(rectangShape)
    })
    setShapes(newShapes)
}

const MouseMove = ({
    event,
    shapes,
    setShapes
}: TriggerEventParam) => {
    const { x, y } = event.currentTarget.getStage()!.getPointerPosition()!
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

const MouseUp = ({
    event,
    shapes,
    setShapes
}: TriggerEventParam) => {
    const { x, y } = event.currentTarget.getStage()!.getPointerPosition()!
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

const onRenderShape = ({
    currentShape,
}: RenderShapeEventParam) => {
    const shape = currentShape as DelLineShape
    return (
        <DelLineEdit
            shape={shape}
            key={nanoid()}
            fill={shape.color}
        />
    )
}
export const registerComponent = () => {
    registerMouseEvent({
        name: 'MouseDown',
        selectBox: 'rectangle',
        onTriggerEvent: onMouseDown
    })

    registerMouseEvent({
        name: 'MouseMove',
        selectBox: 'rectangle',
        onTriggerEvent: MouseMove
    })

    registerMouseEvent({
        name: 'MouseUp',
        selectBox: 'rectangle',
        onTriggerEvent: MouseUp
    })

    registerRenderShapeEvent({
        name: 'rectangle',
        onRenderShapeEvent: onRenderShape
    })
}

export default DelLineEdit
