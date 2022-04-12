import { KonvaEventObject } from "konva/lib/Node";
import { ReactNode } from "react";
import { EditType, MSPosition, SelectBoxType, Shape } from "../types";


export interface TriggerEventParam  {
    event: KonvaEventObject<MouseEvent>
    edit: EditType
    selectBox: SelectBoxType
    shapes: Shape[]
    pageNo: number
    color: string
    mouseDownPosition: MSPosition
    setShapes: (shapes: Shape[]) => void
}

type MouseEventName = 'MouseDown' | 'MouseMove' | 'MouseUp'

interface RegisterMouseEventParam {

    /** 事件名称 */
    name: MouseEventName

    selectBox: SelectBoxType

    /** 订阅的事件 */
    onTriggerEvent: (param: TriggerEventParam) => void
}



const mouseEvent: RegisterMouseEventParam[] = []

export const registerMouseEvent = (param: RegisterMouseEventParam) => {
    mouseEvent.push(param)
}

export const emitMouseEvent = (name: MouseEventName, param: TriggerEventParam) => {
    mouseEvent.filter(ele => ele.name === name && ele.selectBox === param?.selectBox).forEach(ele => {
        ele?.onTriggerEvent?.(param)
    })
}

export interface RenderShapeEventParam  {
    edit: EditType
    shapes: Shape[]
    pageNo: number
    color: string
    currentShape: Shape
    htmlEdit: ReactNode[]
    setShapes: (shapes: Shape[]) => void
}

interface RegisterRenderEventParam {
    name: SelectBoxType
    /** 订阅的事件 */
    onRenderShapeEvent: (param: RenderShapeEventParam) => ReactNode
}

const renderShapeEvent: RegisterRenderEventParam[] = []

export const registerRenderShapeEvent = (param: RegisterRenderEventParam) => {
    renderShapeEvent.push(param)
}

export const emitRenderShapeEvent = (param: RenderShapeEventParam) => {
    const renderShape = renderShapeEvent.find(ele => ele.name === param.currentShape.type)
    return renderShape?.onRenderShapeEvent?.(param)
}
