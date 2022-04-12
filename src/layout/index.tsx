import React, { useState } from 'react'
import { Layout } from '@weblif/fast-ui'
import { css } from '@emotion/css';
import Toolbox from './side/Toolbox'
import PDFContent from './content/PDFContent'
import StateFooter from './footer/StateFooter'
import type { SelectBoxType } from './types'

const { Sider, Content, Footer } = Layout;


interface EditLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    data?: ArrayBuffer
}

const EditLayout = ({
    data,
    ...restProps
}: EditLayoutProps) => {
    const [color, setColor] = useState<string>('#000')
    const [selectBox, setSelectBox] = useState<SelectBoxType>('')
    const [total, setTotal] = useState<number>(0)
    const [current, setCurrent] = useState<number>(1)
    return (
        <Layout
            className={css`
                height: 100%;
                box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
            `}
            {...restProps}
        >
            <Layout
            >
                <Sider
                    className={css`
                        border: 1px solid #ddd;
                    `}
                    width={300}
                >
                    <Toolbox
                        color={color}
                        selectIcon={selectBox}
                        onChangeSelectIcon={(value) => {
                            if (value === selectBox) {
                                setSelectBox('')
                                return
                            }
                            setSelectBox(value)
                        }}
                        onChangeColor={(colorResult) => {
                            setColor(colorResult.hex)
                        }}
                    />
                </Sider>
                <Layout
                    className={css`
                        border-bottom: 1px solid #ddd;
                        border-top: 1px solid #ddd;
                        border-right: 1px solid #ddd;
                    `}
                >
                    <Content
                        className={css`
                            overflow: auto;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        `}
                    >
                        <PDFContent
                            edit={{
                                selectBox,
                                color
                            }}
                            current={current}
                            onChangeTotal={setTotal}
                            data={data}
                        />
                    </Content>
                    <Footer
                        className={css`
                            padding: 10px;
                            background-color: #fff;
                            justify-content: center;
                        `}
                    >
                        <StateFooter
                            total={total}
                            current={current}
                            onChangePage={(page) => {
                                setCurrent(page)
                            }}
                        />
                    </Footer>
                </Layout>
            </Layout>
        </Layout>
    )
}

export default EditLayout
