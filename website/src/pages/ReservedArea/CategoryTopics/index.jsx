import { useEffect, useState } from "react";
import _service from '@netuno/service-client';
import usePeople from "../../../common/usePeople.js";
import { useNavigate } from "react-router-dom";

import globalNotification from "../../../common/globalNotification.js";

import ListHeaderFilters from "../../../components/ListHeaderFilters/index.jsx";
import SupportCommunityDisplay from "../../../components/SupportCommunityDisplay/index.jsx"

import {
  PlusOutlined,
} from "@ant-design/icons";
import { Pagination } from "antd";

function CategoryTopics() {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const loggedUser = usePeople();
  const navigate = useNavigate()
  const mode = 'category'

  useEffect(() => {
    handleListCategories(searchTerm, page);
  }, [page]);

  const handleListCategories = (name = searchTerm, currentPage = page) => {
    setLoading(true);
    _service({
      method: 'GET',
      url: "/forum/category/list",
      data: { name, page: currentPage },
      success: ({ json }) => {
        if (json) {
          setCategoryList(json.data.items);
          setTotalCount(json.data.pagination?.totalCount ?? 0);
        }
        setLoading(false);
      },
      fail: (e) => {
        console.log("Service Error", e);
        setLoading(false);
      }
    });
  };

  const handleCreateCategory = (values) => {
    setLoading(true);
    _service({
      method: 'POST',
      url: "/forum/category",
      data: {
        name: values.name,
        description: values.description
      },
      success: ({ json }) => {
        if (json) {
          globalNotification.success({
            title: 'Categoria Criada',
            description: 'A categoria foi criada com sucesso.',
          });
          closeModal();
          setPage(1);
          handleListCategories(searchTerm, 1);
          return;
        }
        setLoading(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: "Error",
          description: "Não foi possível criar a categoria.",
        });
        console.log("Service Error", e);
        setLoading(false);
      }
    });
  };

  const handleUpdateCategory = (values) => {
    setLoading(true);
    _service({
      method: 'PUT',
      url: "/forum/category",
      data: {
        uid: editingCategory.uid,
        name: values.name,
        description: values.description,
      },
      success: ({ json }) => {
        if (json) {
          globalNotification.success({
            title: 'Categoria Atualizada',
            description: 'A categoria foi atualizada com sucesso.',
          });
          closeModal();
          handleListCategories(searchTerm, page);
          return;
        }
        setLoading(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: "Error",
          description: "Não foi possível atualizar a categoria.",
        });
        console.log("Service Error", e);
        setLoading(false);
      }
    });
  };

  const handleDeleteCategory = (uid) => {
    setLoading(true);
    _service({
      method: 'DELETE',
      url: "/forum/category",
      data: { uid },
      success: ({ json }) => {
        if (json) {
          globalNotification.success({
            title: 'Categoria Removida',
            description: 'A categoria foi removida com sucesso.',
          });
          handleListCategories(searchTerm, page);
          return;
        }
        setLoading(false);
      },
      fail: ({ json }) => {
        if (json.error === "forum-category-has-topics") {
          globalNotification.error({
            title: "Error",
            description: "Não é possivel apagar a categoria, pois existe pelo menos um tópico criado.",
          });
        } else {
          globalNotification.error({
            title: "Error",
            description: "Não foi possível remover a categoria.",
          });
        }
        setLoading(false);
      }
    });
  };

  const handleSearchCategory = (value) => {
    const term = (value || "").trim();
    setSearchTerm(term);
    setPage(1);
    handleListCategories(term, 1);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const onFinish = (values) => {
    const formattedValues = {
      ...values,
      description: values.description
        ?.replace(/\n{3,}/g, "\n\n")
        .trim()
    };
  
    if (editingCategory) {
      handleUpdateCategory(formattedValues);
      return;
    }
  
    handleCreateCategory(formattedValues);
  };
  
  const handleCardClick = (uid) => {
    navigate(`/c/${uid}`)
  }

  return (
    <div className="support-community">
      <ListHeaderFilters
        title="Rede de Apoio"
        description="Um espaço para tirar dúvidas e partilhar experiências. Explore as categorias e participe na conversa."
        searchPlaceholder="Buscar por categoria..."
        createButton={loggedUser.canManageForumCategories() && {
          icon: <PlusOutlined />,
          text: "Criar Categoria",
          onClick: openCreateModal,
        }}
        hideLocation={true}
        onSearch={handleSearchCategory}
        onSearchClear={() => {
          setSearchTerm("");
          setPage(1);
          handleListCategories("", 1);
        }}
      />
      <SupportCommunityDisplay
        loading={loading}
        showModal={showModal}
        onCancel={closeModal}
        editingCategory={editingCategory}
        onFinish={onFinish}
        listItems={categoryList}
        loggedUser={loggedUser}
        handleCardClick={handleCardClick}
        openEditModal={openEditModal}
        handleDelete={handleDeleteCategory}
        mode={mode}
      />
      {!loading && totalCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '24px' }}>
          <Pagination
            current={page}
            pageSize={10}
            total={totalCount}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}

export default CategoryTopics;
