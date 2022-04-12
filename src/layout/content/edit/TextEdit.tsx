import React, { useState } from 'react'
import { Text } from 'react-konva'
import { Input } from '@weblif/fast-ui'
import { TextShape } from '@/layout/types'
import { css } from '@emotion/css'
import Konva from 'konva'

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
