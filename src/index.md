---
nav:
  title: 演示
  path: /components
---

## PDF 编辑

Demo:

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { PDFEdit } from '@weblif/rc-pdf';
import { Button } from '@weblif/fast-ui'
import 'antd/dist/antd.variable.min.css';

export default () => {
    const [data, setData] = useState();
    const pdf = useRef()
    useEffect(() => {
        fetch('https://pdf-lib.js.org/assets/with_update_sections.pdf').then(resp => {
            resp.arrayBuffer().then((buff) => {
                setData(buff)
            })
        })
    }, [])
    return (
        <>
            <Button
                onClick={() => {
                    pdf.current.getPDFToBase64Url().then((text) => {
                        window.open(text)
                    })
                }}
            >
                查看编辑结果
            </Button> <br /><br />
            <PDFEdit
                pdf={pdf}
                style={{ height: 800 }}
                data={data}
            />
        </>
    )
}
```


