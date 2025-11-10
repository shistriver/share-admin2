import React, { useState, useEffect } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Space, Popconfirm, Table, Modal, Form, Radio, message, Upload, Tag } from 'antd';
import type { GetProps } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import type { GetProp, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { addCategories, editeCategories, getCategories, deleteCategory } from '@/services/ant-design-pro/api';
type SearchProps = GetProps<typeof Input.Search>;
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const { Column } = Table;

interface DataType {
  key: React.ReactNode;
  category_name: string;
  description: string;
  icon_url: string;
  status: string;
  sort_order: number;
  updated_at: string;
  children?: DataType[];
}

const validateMessages = {
  required: '${label}必填!',
};

const data: DataType[] = [];

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const Category: React.FC = () => {
  const { Search } = Input;
  const [form] = Form.useForm();
  const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
    // console.log(info?.source, value);
    const params = {
      params: {
        'keyword': value
      }
    }
    fetchData(params)
  }
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [data, setData] = useState<DataType[]>();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [categoryId, setCategoryId] = useState<Number>();
  const [parentId, setParentId] = useState<Number>(0);
  const [level, setLevel] = useState<Number>(1);
  const [modelTitle, setModelTitle] = useState<string>('');

  const [messageApi, contextHolder] = message.useMessage();

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const imgUrl = info.file.response.data.url
      setImageUrl(imgUrl)
      form.setFieldsValue({ icon_url: imgUrl });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const columns: TableColumnsType<DataType> = [
    {
      title: '分类名称',
      dataIndex: 'category_name',
      key: 'category_name',
    },
    {
      title: '分类描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '分类图标',
      dataIndex: 'icon_url',
      key: 'icon_url',
      render: (_, record: DataType) => (
        <img width={40} src={record.icon_url} />
      ),
    },
    {
      title: '分类状态',
      dataIndex: 'status',
      key: 'status',
      render: (_, record: DataType) => {
        if (record.status == 'active') {
          return (
            <Tag color="green">启用</Tag>
          )
        }
        if (record.status == 'inactive') {
          return (
            <Tag color="magenta">禁用</Tag>
          )
        }
      },
    },
    {
      title: '分类层级',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: DataType) => (
        <Space size="middle">
          <a onClick={() => showSubcategory(record)}>添加子分类</a>
          <a onClick={() => editeCategory(record)}>编辑</a>
          <Popconfirm title="确定要删除吗?" onConfirm={() => handleDelete(record)}>
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const showModal = () => {
    setModelTitle('添加顶级分类')
    setIsModalOpen(true);
  };
  
  // 添加子分类
  const showSubcategory = (item: any) => {
    setModelTitle('添加子分类')
    setParentId(item.category_id)
    setLevel(item.level + 1)
    setIsModalOpen(true);
  };

  // 编辑分类
  const editeCategory = (item: any) => {
    setModelTitle('编辑分类')
    setImageUrl(item.icon_url)
    setCategoryId(item.category_id)
    const obj = {
      category_name: item.category_name,
      description: item.description,
      icon_url: item.icon_url,
      sort_order: item.sort_order,
      status: item.status,
    }
    form.setFieldsValue(obj);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (res) => {
      let api: any = null
      if(modelTitle.indexOf('编辑') > -1) {
        const params = {
          ...res
        }
        api = editeCategories(categoryId, params)
      }
      if(modelTitle.indexOf('添加') > -1) {
        const params = {
          parent_id: parentId,
          level: level,
          ...res
        }
        api = addCategories(params)
      }
      const result = await api;

      if(result.success) {
        handleCancel()
        fetchData()
      } else {
        messageApi.open({
          type: 'error',
          content: result.message,
        });
      }
    }).catch(err => { })
  };

  const handleCancel = () => {
    form.resetFields()
    setImageUrl('')
    setParentId(0)
    setLevel(1)
    setIsModalOpen(false);
  };

  const handleDelete = async (record: DataType) => {
    const result = await deleteCategory(record.category_id)
    if(result.success) {
      fetchData()
    } else {
      messageApi.open({
        type: 'error',
        content: result.message,
      });
    }
  }
  
  const fetchData = async (params={}) => {
    setLoading(true);
    const res = await getCategories(params)
    setData(res.data?.list);
    setLoading(false);
  }

  useEffect(() => {
    fetchData()
  }, []);
  return (
    <div>
      <Flex gap="small" wrap>
        <Button type="primary" onClick={showModal}>添加顶级分类</Button>
        <Search placeholder="请输入分类名称" onSearch={onSearch} style={{ width: 200 }} />
      </Flex>
      <Table<DataType>
        columns={columns}
        rowKey="category_id"
        dataSource={data}
      />
      <Modal
        title={modelTitle}
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          name="control-hooks"
          style={{ maxWidth: 600 }}
          initialValues={{ status: 'active' }}
          validateMessages={validateMessages}
        >
          <Form.Item name="category_name" label="分类名称" rules={[{ required: true }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="description" label="分类描述" rules={[{ required: true }]}>
            <Input placeholder="请输入分类描述" />
          </Form.Item>
          <Form.Item name="icon_url" label="分类图标" rules={[{ required: true }]}>
            <ImgCrop rotationSlider>
              <Upload
                name="avatar"
                listType="picture-circle"
                className="avatar-uploader"
                showUploadList={false}
                action="http://127.0.0.1:3000/oss/upload"
                beforeUpload={beforeUpload}
                onChange={handleChange}
              >
                {imageUrl ? (
                  <img draggable={false} src={imageUrl} alt="avatar" style={{ width: '100%' }} />
                ) : (
                  uploadButton
                )}
              </Upload>
            </ImgCrop>
          </Form.Item>
          <Form.Item name="sort_order" label="排序权重" rules={[{ required: true }]}>
            <Input placeholder="请输入排序权重" />
          </Form.Item>
          <Form.Item name="status" label="分类状态" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="active">启用</Radio>
              <Radio value="inactive">禁用</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
};

export default Category;