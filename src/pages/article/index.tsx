import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Radio, Select, message } from 'antd';
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import { getArticle, addArticles, editeArticles } from '@/services/ant-design-pro/articles';
import { history } from '@umijs/max';
import { useLocation, useParams } from '@umijs/max';

const validateMessages = {
  required: '${label}必填!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} is not a valid number!',
  },
  number: {
    range: '${label} must be between ${min} and ${max}',
  },
};

const onFinish = (values: any) => {
  console.log(values);
};
const { Item } = Form;

// 工具栏配置
const toolbarConfig: Partial<IToolbarConfig> = {}

// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: 'http://127.0.0.1:3000/oss/upload',
      fieldName: 'custom-field-name',
    },
    uploadVideo: {
      server: 'http://127.0.0.1:3000/oss/upload',
    }
  },
}

const RichTextForm: React.FC = () => {
  const [form] = Form.useForm();
  const [editorContent, setEditorContent] = useState<string>('');
  const [editorInstance, setEditorInstance] = useState<IDomEditor | null>(null);
  const [loading, setLoading] = useState(false); // 控制按钮加载状态
  const [title, setTitle] = useState('发布文章');
  const [isEdit, setIsEdit] = useState(false);
  const [articleId, setArticleId] = useState('');

  // 1. 获取动态路由参数（直接拿到 id，无需解析）
  const { id } = useParams();
  // 2. 监听路由变化（若组件已挂载，路由参数更新时触发）
  const location = useLocation();
  useEffect(() => {
    // 仅当路由是 /article/edit/:id 时执行逻辑（可选，防止其他路由触发）
    if (location.pathname.startsWith('/article/edit/')) {
      setTitle('编辑文章')
      setIsEdit(true)
      if(id) {
        handleArticle(id)
      }
    }
  }, [location.pathname, id]);
  
  // 根据id获取文章信息
  const handleArticle = async (id: string) => {
    const res = await getArticle(id)
    setEditorContent(res.data.content)
    setArticleId(id)
    form.setFieldsValue({ ...res.data });
  };

  // 初始化编辑器
  useEffect(() => {
    return () => {
      // 组件卸载时销毁编辑器
      if (editorInstance) {
        editorInstance.destroy();
        setEditorInstance(null);
      }
    };
  }, [editorInstance]);

  // 表单提交处理
  const handleSubmit = async () => {
    try {
      // 手动触发表单验证
      console.log('isEdit', isEdit)
      const values = await form.validateFields();
      setLoading(true);
      const params = {
        title: values.title,
        subtitle: values.subtitle,
        coverImageUrl: values.coverImageUrl,
        content: values.content,
        summary: values.summary,
        authorId: 1,
        status: values.status,
        visibility: values.visibility,
        isFeatured: values.isFeatured,
        resourceUrl: values.resourceUrl,
        downloadPointThreshold: values.downloadPointThreshold,
      }

      if(isEdit) {
        await editeArticles(articleId, params)
        tips('更新成功！')
      } else {
        await addArticles(params)
        tips('提交成功！')
      }
      
    } catch (error) {
      message.error('请完善表单内容后再提交');
      setLoading(false);
    }
  };

  const tips = (str: string) => {
    message.success(str, 2, ()=> {
      history.go(-1);
      setTimeout(() => {
        setLoading(false);
      }, 2000)
    })
  }

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    if (editorInstance) {
      editorInstance.clear();
      setEditorContent('');
    }
  };

  // 返回上一页
  const goback = () => {
    history.go(-1);
  }

  return (
    <div>
      <h2 style={{ marginBottom: 20, textAlign: 'center' }}>{title}</h2>
      <Form
        form={form}
        name="nest-messages"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={onFinish}
        validateMessages={validateMessages}
        initialValues={{ status: 'draft', visibility: 'public', isFeatured: 0, downloadPointThreshold: 0 }}
      >
        <Form.Item name="title" label="文章标题" rules={[{ required: true }]}>
          <Input placeholder="请输入文章标题" />
        </Form.Item>
        <Form.Item name="subtitle" label="文章副标题" rules={[{ required: true }]}>
          <Input placeholder="请输入文章副标题" />
        </Form.Item>
        <Form.Item name="coverImageUrl" label="封面图" rules={[{ required: true }]}>
          <Input placeholder="请输入封面图" />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select>
            <Select.Option value="draft">草稿</Select.Option>
            <Select.Option value="pending_review">待审核</Select.Option>
            <Select.Option value="published">已发布</Select.Option>
            <Select.Option value="rejected">已驳回</Select.Option>
            <Select.Option value="archived">已归档</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="visibility" label="可见性">
          <Select>
            <Select.Option value="public">公开</Select.Option>
            <Select.Option value="private">仅自己可见</Select.Option>
            <Select.Option value="password_protected">密码保护</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="isFeatured" label="推荐">
          <Radio.Group>
            <Radio value={1}>是</Radio>
            <Radio value={0}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="summary" label="文章摘要" rules={[{ required: true }]}>
          <Input.TextArea showCount maxLength={200} autoSize={{ minRows: 3, maxRows: 5 }} placeholder="请输入文章摘要" />
        </Form.Item>
        <Form.Item name="downloadPointThreshold" label="下载积分" rules={[{ required: true }]}>
          <Input placeholder="请输入下载积分（0表示免费）" />
        </Form.Item>
        <Form.Item name="resourceUrl" label="资源地址" rules={[{ required: true }]}>
          <Input placeholder="请输入资源地址" />
        </Form.Item>
        <Form.Item
          name="content"
          label="内容"
          rules={[
            {
              required: true,
              message: '请输入内容'
            },
            {
              validator: (_, value) => {
                // 处理富文本编辑器的各种空内容情况
                if (!value) {
                  return Promise.reject(new Error('请输入内容'));
                }

                // 移除所有HTML标签
                const withoutTags = value.replace(/<[^>]+>/g, '');
                // 移除所有空白字符（包括&nbsp;等HTML实体）
                const plainText = withoutTags.replace(/&nbsp;|\s/g, '');

                if (plainText === '') {
                  return Promise.reject(new Error('内容不能只包含空白字符'));
                }

                return Promise.resolve();
              }
            }
          ]}
        >
          <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, zIndex: 100 }}>
            <Toolbar
              editor={editorInstance}
              defaultConfig={toolbarConfig}
              mode="default"
              style={{ borderBottom: '1px solid #e8e8e8' }}
            />
            <Editor
              defaultConfig={editorConfig}
              value={editorContent}
              onChange={(editor) => {
                const value = editor.getHtml();
                setEditorContent(value);
                // 同步更新表单字段值
                form.setFieldsValue({ content: value });
              }}
              onCreated={setEditorInstance}
              mode="default"
              style={{ height: '500px', overflowY: 'hidden' }}
            />
          </div>
        </Form.Item>

        <Form.Item style={{ textAlign: 'center', marginTop: 20 }}>
          <Button
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            style={{ marginRight: 10 }}
          >
            提交
          </Button>
          <Button
            onClick={handleReset}
            style={{ marginRight: 10 }}
          >
            重置
          </Button>
          <Button
            onClick={goback}
            style={{ marginRight: 10 }}
          >
            返回上一页
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RichTextForm;
