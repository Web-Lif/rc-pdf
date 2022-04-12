import Konva from 'konva'
import React from 'react'
import { Line } from 'react-konva'
import { DelLineShape } from '../../types'

interface RectangleEditProps {
    height?: number
    shape: DelLineShape
    fill?: string
    onChange: (value: string) => void
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void
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

export default DelLineEdit
