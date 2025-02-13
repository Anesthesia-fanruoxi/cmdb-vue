import React, { useState, useEffect } from 'react';
import { Layout, List, Typography } from 'antd';
import styles from './PersonalSpace.module.css';

const { Sider, Content } = Layout;
const { Title } = Typography;

const PersonalSpace = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/knowledge/personal/list');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setDocuments(data);
      }
    } catch (error) {
      console.error('获取文档列表失败:', error);
      setDocuments([]);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDocSelect = (doc) => {
    setSelectedDoc(doc);
  };

  return (
    <Layout className={styles.container}>
      <Sider width={250} theme="light" className={styles.sider}>
        <Title level={4} className={styles.siderTitle}>个人文档</Title>
        <List
          dataSource={documents}
          renderItem={(doc) => (
            <List.Item
              key={doc.id}
              className={`${styles.docItem} ${selectedDoc?.id === doc.id ? styles.selected : ''}`}
              onClick={() => handleDocSelect(doc)}
            >
              <Typography.Text>{doc.title}</Typography.Text>
            </List.Item>
          )}
        />
      </Sider>
      <Content className={styles.content}>
        {selectedDoc ? (
          <div className={styles.docContent}>
            <Title level={3}>{selectedDoc.title}</Title>
            <div className={styles.docBody}>
              {selectedDoc.content}
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            请选择一个文档查看
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default PersonalSpace; 