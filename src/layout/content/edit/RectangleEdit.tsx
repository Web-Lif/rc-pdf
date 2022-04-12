import produce from 'immer'
import Konva from 'konva'
import { nanoid } from 'nanoid'
import React from 'react'
import { Rect } from 'react-konva'
import { isRectangleShape, RectangleShape } from '../../types'
import { registerMouseEvent, registerRenderShapeEvent, RenderShapeEventParam, TriggerEventParam } from '../register'


interface RectangleEditProps {
    height?: number
    shape: RectangleShape
    fill?: string
    onChange?: (value: string) => void
    onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void
}

/** 矩形编辑器, 用来编辑和改变文件信息*/
const RectangleEdit = ({
    shape,
    fill
}: RectangleEditProps) => {
    return (
        <Rect
            x={shape.position.x}
            y={shape.position.y}
            width={shape.width}
            height={shape.height}
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
            pageNo: pageNo
        }
        draft.push(rectangShape)
    })
    setShapes(newShapes)
}

const MouseMove = ({
    event,
    shapes,
    mouseDownPosition,
    setShapes
}: TriggerEventParam) => {
    const { x, y } = event.currentTarget.getStage()!.getPointerPosition()!
    const newShapes = produce(shapes, (draft) => {
        draft.some(ele => {
            if (ele.state === 'new' && isRectangleShape(ele)) {
                ele.width = Math.abs(mouseDownPosition.x - x),
                ele.height = Math.abs(mouseDownPosition.y - y)
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
    mouseDownPosition,
    setShapes
}: TriggerEventParam) => {
    const { x, y } = event.currentTarget.getStage()!.getPointerPosition()!
    const newShapes = produce(shapes, (draft) => {
        draft.some(ele => {
            if (ele.state === 'new' && isRectangleShape(ele)) {
                ele.width = Math.abs(mouseDownPosition.x - x)
                ele.height = Math.abs(mouseDownPosition.y - y)
                ele.state = 'normal'
            }
        })
    })
    setShapes(newShapes)
}

const onRenderShape = ({
    currentShape
}: RenderShapeEventParam) => {
    const shape = currentShape as RectangleShape
    return (
        <RectangleEdit
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

export default RectangleEdit
