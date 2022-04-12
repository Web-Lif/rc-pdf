---
nav:
  title: 演示
  path: /components
---

## PDF 编辑

Demo:

```tsx
import React, { useState, useEffect } from 'react';
import { PDFEdit } from 'ms-pdf';
import 'antd/dist/antd.variable.min.css';


export default () => {
    const [data, setData] = useState();
    useEffect(() => {
        fetch('/test.pdf').then(resp => {
            resp.arrayBuffer().then((buff) => {
                setData(buff)
            })
        })
    }, [])
    return (
        <PDFEdit
            style={{ height: 800 }}
            data={data}
        />
    )
}
```


