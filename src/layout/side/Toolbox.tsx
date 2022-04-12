import React, { MouseEventHandler, ReactNode } from 'react'
import { css } from '@emotion/css';
import { BsType, BsStop, BsDash } from "react-icons/bs";
import { ColorChangeHandler, SketchPicker } from 'react-color';
import type { SelectBoxType } from '../types'

interface ToolBoxIconProps {
    icon: ReactNode
    title: string
    name: string
    select?: boolean
    onClick?: MouseEventHandler
}

const ToolBoxIcon = ({
    icon,
    title,
    select,
    onClick
}: ToolBoxIconProps) => {
    return (
        <div
            className={css`
                cursor: pointer;
                display: inline-block;
                box-sizing: border-box;
                text-align: center;
                height: 80px;
                width: 70px;
                padding: 10px 10px;
                margin: 0px 4px;
                border: 4px;
                user-select: none;
                transition: box-shadow .4s;
                > svg {
                    font-size: 2rem;
                }
                ${select ? 'box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;' : null}
                &:hover {
                    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
                }
            `}
            onClick={(event) => {
                onClick?.(event)
            }}
        >
            {icon}
            <div>
                {title}
            </div>
        </div>
    )
}


interface ToolboxProps {
    color: string
    onChangeColor: ColorChangeHandler

    selectIcon: SelectBoxType
    onChangeSelectIcon: (select: SelectBoxType) => void
}

/** 工具箱 */
const Toolbox = ({
    color,
    onChangeColor,
    selectIcon,
    onChangeSelectIcon
}: ToolboxProps) => {
    return (
        <div
            className={css`
                height: 100%;
                width: 100%;
                background-color: #fff;
            `}
        >
            <div
                className={css`
                    padding: .5rem;
                    border-bottom: 1px solid #ddd;
                    font-weight: bold;
                    color: rgba(0,0,0, .65);
                `}
            >
                工具栏
            </div>
            <div
                className={css`
                    padding: 1rem;
                `}
            >
                <ToolBoxIcon
                    icon={<BsType />}
                    title="文字"
                    name="text"
                    select={'text' === selectIcon}
                    onClick={() => {
                        onChangeSelectIcon?.('text')
                    }}
                />

                <ToolBoxIcon
                    icon={<BsStop />}
                    title="矩形"
                    name="rectangle"
                    select={'rectangle' === selectIcon}
                    onClick={() => {
                        onChangeSelectIcon?.('rectangle')
                    }}
                />

                <ToolBoxIcon
                    icon={<BsDash />}
                    title="删除线"
                    name="delLine"
                    select={'delLine' === selectIcon}
                    onClick={() => {
                        onChangeSelectIcon?.('delLine')
                    }}
                />
            </div>
            <div
                className={css`
                    padding: .5rem;
                    border-top: 1px solid #ddd;
                    border-bottom: 1px solid #ddd;
                    font-weight: bold;
                    color: rgba(0,0,0, .65);
                `}
            >
                颜色
            </div>
            <div
                className={css`
                    display: flex;
                    margin-top: 2rem;
                    justify-content: center;
                `}
            >
                <SketchPicker
                    color={color}
                    width="80%"
                    onChange={onChangeColor}
                />
            </div>
        </div>
    )
}

export default Toolbox
