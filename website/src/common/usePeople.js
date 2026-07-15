import { peopleLoadAction } from "../redux/actions/index.js";
import { useDispatch, useSelector } from "react-redux";
import _service from "@netuno/service-client";
import globalNotification from "./globalNotification.js";
import _auth from "@netuno/auth-client";

const MEMBER = "member";

let unloaded = false;

function usePeople() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.people.data);

  const loggedUserGroupCode = data?.group?.code;

  const isSuperAdmin = loggedUserGroupCode === "super-admin";
  const isManager = loggedUserGroupCode === "management";
  const isReview = loggedUserGroupCode === "review";

  const isLoggedUserInstitution = (institutionUid) => {
    const loggedUserInstitutionUid = data?.institution?.uid;
    return loggedUserInstitutionUid === institutionUid;
  }

  const canManageUserOrCreateMember = (otherUserGroupCode, otherUserInstitutionUid) => {
    return (isSuperAdmin ||
      (
        isManager &&
        isLoggedUserInstitution(otherUserInstitutionUid) &&
        otherUserGroupCode === MEMBER
      )
    );
  }

  const load = (onFinish) => {
    unloaded = false;
    _service({
      method: 'GET',
      url: 'people/me',
      success: (response) => {
        if (response.json.result) {
          dispatch(peopleLoadAction(response.json.data));
          onFinish && onFinish(true);
        } else {
          globalNotification.warning({
            title: 'Dados do Usuário',
            description: response.json.error,
          });
          onFinish && onFinish(false);
          _auth.logout();
        }
      },
      fail: (e) => {
        console.error('Dados do Usuário', e);
        globalNotification.serviceFail({
          title: 'Dados do Usuário',
          description: 'Ocorreu um erro a carregar os dados, por favor tente novamente mais tarde.',
        });
        _auth.logout();
        onFinish && onFinish(false);
      }
    });
  };

  const save = (personData, callbacks = {}) => {
    const isEditing = !!personData.uid;

    _service({
      method: isEditing ? 'PUT' : 'POST',
      url: 'people',
      data: personData,
      success: (response) => {
        if (response.json.result) {
          callbacks.onSuccess && callbacks.onSuccess(response.json);
        } else {
          globalNotification.warning({
            title: isEditing ? 'Atualizar Pessoa' : 'Nova Pessoa',
            description: response.json.error || 'Não foi possível guardar o registro.',
          });
          callbacks.onFail && callbacks.onFail(response.json);
        }
      },
      fail: (e) => {
        console.error('Erro ao guardar pessoa:', e);
        globalNotification.serviceFail({
          title: isEditing ? 'Atualizar Pessoa' : 'Nova Pessoa',
          description: 'Ocorreu um erro de comunicação ao guardar. Tente novamente mais tarde.',
        });
        callbacks.onFail && callbacks.onFail(e);
      }
    });
  };

  const remove = (uid, callbacks = {}) => {
    _service({
      method: 'DELETE',
      url: 'people',
      data: { uid },
      success: (response) => {
        if (response.json.result) {
          callbacks.onSuccess && callbacks.onSuccess(response.json);
        } else {
          globalNotification.warning({
            title: 'Apagar Pessoa',
            description: response.json.error || 'Não foi possível apagar o registro.',
          });
          callbacks.onFail && callbacks.onFail(response.json);
        }
      },
      fail: (e) => {
        console.error('Erro ao apagar pessoa:', e);
        globalNotification.serviceFail({
          title: 'Apagar Pessoa',
          description: 'Ocorreu um erro de comunicação ao apagar. Tente novamente mais tarde.',
        });
        callbacks.onFail && callbacks.onFail(e);
      }
    });
  };

  return {
    data,
    set: (data) => {
      unloaded = false;
      dispatch(peopleLoadAction(data));
    },
    load,
    unload: () => {
      unloaded = true;
      dispatch(peopleLoadAction(null));
    },
    isUnloaded: () => unloaded,
    reload: () => {
      dispatch(peopleLoadAction(null));
      load();
    },
    save, remove,
    canCreateAnyUser: () => isSuperAdmin,
    canCreateMember: (institution) => canManageUserOrCreateMember(MEMBER, institution?.uid),
    canManageUser: (user) => canManageUserOrCreateMember(user?.group?.code, user?.institution?.uid),
    // TODO: trocar essas funções que retornam apenas isSuperAdmin e isReview para variáveis?
    // talvez não, porque como funções elas ficam mais consistentes com as outras funções
    canChangeUserGroup: () => isSuperAdmin,
    canChangeUserInstitution: () => isSuperAdmin,
    canChangeOwnInstitution: () => isSuperAdmin,
    canCreateInstitutions: () => isSuperAdmin,
    canManageInstitution: (institutionUid) => (isSuperAdmin || (isManager && isLoggedUserInstitution(institutionUid))),
    canManagePosts: () => isReview,
    canManageLocations: () => isSuperAdmin,
  };
}

export default usePeople;
