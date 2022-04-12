import React from 'react'
import { InputNumber, Pagination } from '@weblif/fast-ui'
import { css } from '@emotion/css'

interface StateFooterProps {
    current: number
    total: number
    value?: number
    onChangePage?: (page: number, pageSize: number) => void
    onChangeValue?: (val: number) => void
}

const StateFooter = ({
    current,
    total,
    value = 100,
    onChangePage,
    onChangeValue
}: StateFooterProps) => {
    return (
        <div
            className={css`
                display: flex;
            `}
        >
            <InputNumber
                className={css`
                    width: 150px;
                `}
                value={value}
                onChange={(changeValue) => {
                    onChangeValue?.(changeValue as number)
                }}
                disabled
                addonAfter="%"
                addonBefore="缩放"
            />
            <div
                className={css`
                    flex: 1;
                `}
            />
            <Pagination
                className={css`
                    margin-top: 5px;
                `}
                current={current}
                total={total}
                pageSize={1}
                simple
                onChange={onChangePage}
            />
        </div>
    )
}

export default StateFooter
