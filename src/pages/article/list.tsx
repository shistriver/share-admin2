import type {
  ActionType,
  ProColumns,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useRequest, history } from '@umijs/max';
import { Button, Drawer, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import { getArticleList, delArticle } from '@/services/ant-design-pro/articles';

// 定义文章数据类型
interface ArticleItem {
  id: number;
  title: string;
  subtitle: string;
  summary: string;
  status: string;
  visibility: string;
  isFeatured: number;
  pointThreshold: number;
  createdAt: string;
  updatedAt: string;
}

const ArticleList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<ArticleItem>();
  const [selectedRowsState, setSelectedRows] = useState<ArticleItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const [messageApi, contextHolder] = message.useMessage();

  // 获取文章列表
  const getArticles = async (params: any, sort: any, filter: any) => {
    // API调用
    const res = await getArticleList(params)
    return res;
  };

  // 删除文章
  const deleteArticle = async (id: number) => {
    // API调用
    await delArticle(id)
    return { success: true };
  };

  // 批量删除文章
  const batchDeleteArticles = async (ids: number[]) => {
    // 模拟API调用
    return { success: true };
  };

  const { run: delRun, loading } = useRequest(deleteArticle, {
    manual: true,
    onSuccess: () => {
      setSelectedRows([]);
      actionRef.current?.reloadAndRest?.();
      messageApi.success('删除成功');
    },
    onError: () => {
      messageApi.error('删除失败，请重试');
    },
  });

  const { run: batchDelRun } = useRequest(batchDeleteArticles, {
    manual: true,
    onSuccess: () => {
      setSelectedRows([]);
      actionRef.current?.reloadAndRest?.();
      messageApi.success('批量删除成功');
    },
    onError: () => {
      messageApi.error('批量删除失败，请重试');
    },
  });

  const columns: ProColumns<ArticleItem>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '副标题',
      dataIndex: 'subtitle',
      valueType: 'textarea',
      hideInSearch: true,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      valueType: 'textarea',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        draft: {
          text: '草稿',
        },
        pending_review: {
          text: '待审核',
        },
        published: {
          text: '已发布',
        },
        rejected: {
          text: '已驳回',
        },
        archived: {
          text: '已归档',
        },
      },
    },
    {
      title: '可见性',
      dataIndex: 'visibility',
      valueEnum: {
        public: {
          text: '公开',
        },
        private: {
          text: '仅自己可见',
        },
        password_protected: {
          text: '密码保护',
        },
      },
    },
    {
      title: '推荐',
      dataIndex: 'isFeatured',
      valueEnum: {
        0: {
          text: '否',
        },
        1: {
          text: '是',
        },
      },
    },
    {
      title: '下载积分',
      dataIndex: 'pointThreshold',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            // 跳转到编辑页面
            history.push(`/article/edit/${record.id}`);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title={'删除文章？'}
          onConfirm={async () => {
            await delRun(record.id);
          }}
          okText={'确认'}
          cancelText={'取消'}
        >
          <a>{'删除'}</a>
        </Popconfirm>,
      ],
    },
  ];

  /**
   *  Delete node
   * @zh-CN 删除节点
   *
   * @param selectedRows
   */
  const handleRemove = async (selectedRows: ArticleItem[]) => {
    if (!selectedRows?.length) {
      messageApi.warning('请选择删除项');
      return;
    }

    await batchDelRun(selectedRows.map((row) => row.id));
  };

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<ArticleItem>
        headerTitle={'文章列表'}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={() => {
              history.push('/article/create');
            }}
          >
            {'新增文章'}
          </Button>,
        ]}
        request={getArticles}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        pagination={{
          pageSize: 10, // 每页条数
          defaultCurrent: 1, // 默认当前页
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              {'已选择'} <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> {'项'}
            </div>
          }
        >
          <Button
            loading={loading}
            onClick={() => {
              handleRemove(selectedRowsState);
            }}
          >
            {'批量删除'}
          </Button>
        </FooterToolbar>
      )}

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.title && (
          <ProDescriptions<ArticleItem>
            column={2}
            title={currentRow?.title}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<ArticleItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ArticleList;