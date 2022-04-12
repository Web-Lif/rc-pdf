
export type SelectBoxType = 'text' | 'rectangle' | 'delLine' | '';
export type MSPosition  = {
    x: number
    y: number
}

export type EditType = {
    selectBox: SelectBoxType
    color: string
}


export interface Shape {
    id: string
    color: string
    type: SelectBoxType
    position: MSPosition
    state: 'new' | 'normal' | 'edit'
    pageNo: number
}

export interface TextShape extends Shape {
    text: string
    size: number
}

export interface RectangleShape extends Shape {
    width: number
    height: number
}

export function isRectangleShape(value: any): value is RectangleShape {
    return !!(
        value &&
        value.type === 'rectangle' &&
        typeof value === 'object'
    );
}


export function isTextShape(value: any): value is TextShape {
    return !!(
        value &&
        value.type === 'text' &&
        typeof value === 'object'
    );
}
