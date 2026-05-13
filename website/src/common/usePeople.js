import {peopleLoadAction} from "../redux/actions/index.js";
import {useDispatch, useSelector} from "react-redux";
import _service from "@netuno/service-client";
import globalNotification from "./globalNotification.js";
import _auth from "@netuno/auth-client";

const SUPER_ADMIN = "super-admin";
const REVIEW = "review";
const MANAGEMENT = "management";
const MEMBER = "member";

function usePeople() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.people.data);
  const isLoggedUserGroup = (groupCode) => {
    const loggedUserGroupCode = data?.group?.code; 
    return loggedUserGroupCode === groupCode; 
  }
  const isLoggedUserInstitution = (institutionUid) => {
    const loggedUserInstitutionUid = data?.institution?.uid;
    return loggedUserInstitutionUid === institutionUid;
  }
  const canManageUserOrCreateMember = (otherUserGroupCode, otherUserInstitutionUid) => {
      return (
        (
          isLoggedUserGroup(SUPER_ADMIN)
        ) || (
          isLoggedUserGroup(MANAGEMENT) &&
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
    canCreateAnyUser: () => isLoggedUserGroup(SUPER_ADMIN),
    canCreateMember: (institution) => {
      return canManageUserOrCreateMember(MEMBER, institution?.uid);
    },
    canManageUser: (user) => {
      return canManageUserOrCreateMember(user?.group?.code, user?.institution?.uid);
    },
    canChangeUserGroup: () => isLoggedUserGroup(SUPER_ADMIN),
    canChangeUserInstitution: () => isLoggedUserGroup(SUPER_ADMIN),
    canChangeOwnInstitution: () => isLoggedUserGroup(SUPER_ADMIN),
    canCreateInstitutions: () => isLoggedUserGroup(SUPER_ADMIN),
    canManageInstitution: (institutionUid) => {
      return (
        (
          isLoggedUserGroup(SUPER_ADMIN)
        ) || (
          isLoggedUserGroup(MANAGEMENT) &&
          isLoggedUserInstitution(institutionUid)
        )
      );
    },
    canManagePosts: () => isLoggedUserGroup(REVIEW),
  };
}

export default usePeople;
