import { useCallback, useEffect, useState } from 'react'
import {
  Cascader,
  Input,
  Button,
  Upload,
  Modal,
  Form,
  Space,
  Empty,
  message
} from 'antd'
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons'
import useNFT from './useNFT'
import { MintableResp } from './service'

interface MintModalProps {
  open: boolean
  onOk: () => void
  onClose: () => void
}

interface Option {
  value?: string | number | null
  label: React.ReactNode
  children?: Option[]
  isLeaf?: boolean
}

interface FormValue {
  db: string[]
  description: string
  image: string
}

export default function MintModal(props: MintModalProps) {
  const { account, client, mint, getMintable } = useNFT()
  const [form] = Form.useForm<FormValue>()
  const [mintable, setMintable] = useState<MintableResp>()
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [img, setImg] = useState<File>()

  const db = Form.useWatch('db', form)

  const onClose = useCallback(() => {
    form.resetFields()
    setImg(undefined)
    setMintable(undefined)
    props.onClose()
  }, [form, props])

  const onLoadData = async (items: Option[]) => {
    if (!client) return
    if (items.length === 2) {
      const namespace = items[0].value as string
      const dataset = items[1].value as string
      const result = await client.namespace(namespace).queryDataset(dataset)
      const children = result.collections.map(item => ({
        value: item.collection,
        label: item.collection,
        isLeaf: true
      }))
      items[1].children = children
      setOptions([...options])
    }
  }

  const loadNamespaces = useCallback(async () => {
    if (!account || !client) return
    const items = await client.namespaces(account)
    const options: Option[] = items.map(item => ({
      value: item.namespace,
      label: item.namespace,
      children: item.dataset.map(dataset => ({
        value: dataset,
        label: dataset,
        isLeaf: false
      })),
      isLeaf: false
    }))
    setOptions(options)
  }, [account, client])

  const onBeforeUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      message.error('Invalid picture file')
      return false
    }
    setImg(file)
    return false
  }, [])

  const onMint = useCallback(async () => {
    const values = await form.validateFields()
    if (!img) return message.error('Please select a picture')
    try {
      if (db?.length !== 3 || !mintable) return
      setLoading(true)
      const result = await mint(
        db[0],
        db[1],
        db[2],
        values.description,
        img,
        mintable
      )
      if (result === 'ok') {
        message.success('Mint successful')
      } else {
        message.error('Mint failed')
      }
      props.onOk()
      onClose()
    } catch (e: any) {
      message.error(e.message || 'Mint error')
    } finally {
      setLoading(false)
    }
  }, [db, form, img, mintable, mint, props, onClose])

  useEffect(() => {
    if (db?.length !== 3) {
      setMintable(undefined)
      return
    }
    setMintable(undefined)
    setChecking(true)
    getMintable(db[0], db[1], db[2]).then(result => {
      if (result) setMintable(result)
      else {
        setMintable(undefined)
        message.error('Network error')
      }
    }).finally(() => {
      setChecking(false)
    })
  }, [db, getMintable])

  useEffect(() => {
    loadNamespaces()
  }, [loadNamespaces])

  return (
    <Modal
      title="Mint my NFT"
      open={props.open}
      onCancel={onClose}
      footer={[
        <Button type="text" key="cancel" disabled={loading} onClick={onClose}>
          Cancel
        </Button>,
        <Button type="primary" key="mint" loading={loading} onClick={onMint}>
          Mint
        </Button>
      ]}
    >
      <Form layout="vertical" form={form} className="py-5" disabled={loading}>
        <Form.Item
          label="Collection"
          name="db"
          rules={[
            {
              required: true,
              message: 'Collection is required'
            }
          ]}
        >
          <Cascader
            placeholder="Select a collection"
            options={options}
            loadData={onLoadData}
          />
        </Form.Item>
        {mintable?.mintable === true && (
          <>
            <Form.Item
              label="Description"
              name="description"
              rules={[
                {
                  required: true,
                  message: 'Description is required'
                }
              ]}
            >
              <Input placeholder="NFT description" />
            </Form.Item>
            <Form.Item
              label="Image (less than 2MB)"
              required
              rules={[
                {
                  required: true,
                  message: 'Image is required'
                }
              ]}
            >
              <Space direction="vertical">
                <Upload
                  accept="image/*"
                  beforeUpload={onBeforeUpload}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Select a picture</Button>
                  {!!img && <div className="text-sm mt-2">{img?.name}</div>}
                </Upload>
              </Space>
            </Form.Item>
          </>
        )}
        {mintable?.mintable === false && (
          <Empty description="This collection does not support mint." />
        )}
        {checking && (
          <div className='flex items-center justify-center py-12'>
            <LoadingOutlined />
          </div>
        )}
      </Form>
    </Modal>
  )
}
