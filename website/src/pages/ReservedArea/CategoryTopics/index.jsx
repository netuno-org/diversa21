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

function CategoryTopics() {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const loggedUser = usePeople();
  const navigate = useNavigate()
  const mode = 'category'

  useEffect(() => {
    handleListCategories();
  }, []);

  const handleListCategories = (name = '') => {
    setLoading(true);
    _service({
      method: 'GET',
      url: "/forum/category/list",
      data: { name },
      success: ({ json }) => {
        if (json) {
          setCategoryList(json.data.items);
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
          handleListCategories();
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
          handleListCategories();
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
          handleListCategories();
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
    handleListCategories(value);
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
    if (editingCategory) {
      handleUpdateCategory(values);
      return;
    }
    handleCreateCategory(values);
  };

  const handleCardClick = (uid) => {
    navigate(`/c/${uid}`)
  }

  return (
    <div className="support-community">
      <ListHeaderFilters
        title="Rede de apoio"
        searchPlaceholder="Buscar por categoria"
        createButton={loggedUser.canManageForumCategories() && {
          icon: <PlusOutlined />,
          text: "Criar categoria",
          onClick: openCreateModal,
        }}
        hideLocation={true}
        onSearch={handleSearchCategory}
        onSearchClear={() => handleListCategories("")}
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
    </div>
  );
}

export default CategoryTopics;
