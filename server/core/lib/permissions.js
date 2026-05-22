import people from "#core/lib/people.js";
import { MEMBER, MANAGEMENT, REVIEW, SUPER_ADMIN } from "#core/lib/groups.js";

const loggedUserGroupCode = _group.code();

const isManager = loggedUserGroupCode === MANAGEMENT; 
const isReview = loggedUserGroupCode === REVIEW; 
const isSuperAdmin = loggedUserGroupCode === SUPER_ADMIN; 

const isLoggedUserInstitution = (institutionUid) => {
  const peopleUid = people.getLogged().getUID("uid");
  const data = people.getData(peopleUid);
  const loggedUserInstitutionUid = data.getValues("institution").getUID("uid");
  return loggedUserInstitutionUid.equals(institutionUid);
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

export default {
  canCreateAnyUser: () => isSuperAdmin,
  canCreateMember: (newMemberGroupCode, newMemberInstitutionUid) => {
    return canManageUserOrCreateMember(newMemberGroupCode, newMemberInstitutionUid);
  },
  canManageUser: (userGroupCode, userInstitutionUid) => canManageUserOrCreateMember(userGroupCode, userInstitutionUid),
  // canChangeUserGroup: () => isSuperAdmin,
  // canChangeUserInstitution: () => isSuperAdmin,
  canChangeOwnInstitution: () => isSuperAdmin,
  canCreateInstitutions: () => isSuperAdmin,
  canManageInstitution: (institutionUid) => (isSuperAdmin || (isManager && isLoggedUserInstitution(institutionUid))),
  canManagePosts: () => isReview,
  canManageLocations: () => isSuperAdmin,
}
