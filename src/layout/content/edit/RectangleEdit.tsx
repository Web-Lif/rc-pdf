import Konva from 'konva'
import React from 'react'
import { Rect } from 'react-konva'
import { RectangleShape } from '../../types'

interface RectangleEditProps {
    height?: number
    shape: RectangleShape
    fill?: string
    onChange: (value: string) => void
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void
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

export default RectangleEdit
