import {peopleLoadAction} from "../redux/actions/index.js";
import {useDispatch, useSelector} from "react-redux";
import _service from "@netuno/service-client";
import globalNotification from "./globalNotification.js";
import _auth from "@netuno/auth-client";

const MEMBER = "member";

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
    _service({
      method: 'GET',
      url: 'people/me',
      success: (response) => {
        if (response.json.result) {
          dispatch(peopleLoadAction(response.json.data));
          onFinish && onFinish(true);
        } else {
          globalNotification.warning({
            title: 'Dados do Utilizador',
            description: response.json.error,
          });
          onFinish && onFinish(false);
          _auth.logout();
        }
      },
      fail: (e) => {
        console.error('Dados do Utilizador', e);
        globalNotification.serviceFail({
          title: 'Dados do Utilizador',
          description: 'Ocorreu um erro a carregar os dados, por favor tente novamente mais tarde.',
        });
        _auth.logout();
        onFinish && onFinish(false);
      }
    });
  };
  return {
    data,
    set: (data) => {
      dispatch(peopleLoadAction(data));
    },
    load,
    unload: () => {
      dispatch(peopleLoadAction(null));
    },
    reload: () => {
      dispatch(peopleLoadAction(null));
      load();
    },
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
  };
}

export default usePeople;
