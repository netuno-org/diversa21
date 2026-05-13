import people from "#core/lib/people.js";

const peopleUid = people.getLogged().getUID("uid");
const data = people.getData(peopleUid);

const loggedUserGroupCode = data.getValues("group").getString("code");
const loggedUserInstitutionUid = data.getValues("institution").getUID("uid");

const SUPER_ADMIN = "super-admin";
const REVIEW = "review";
const MANAGEMENT = "management";
const MEMBER = "member";

const isLoggedUserGroup = (groupCode) => {
  const loggedUserGroupCode = _group.code();
  return loggedUserGroupCode === groupCode; 
}

const isLoggedUserInstitution = (institutionUid) => {
  const peopleUid = people.getLogged().getUID("uid");
  const data = people.getData(peopleUid);
  const loggedUserInstitutionUid = data.getValues("institution").getUID("uid");
  return loggedUserInstitutionUid.equals(institutionUid);
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

export default {
  canCreateAnyUser: () => isLoggedUserGroup(SUPER_ADMIN),
  canCreateMember: (newMemberGroupCode, newMemberInstitutionUid) => {
    return canManageUserOrCreateMember(newMemberGroupCode, newMemberInstitutionUid);
  },
  canManageUser: (userGroupCode, userInstitutionUid) => {
    return canManageUserOrCreateMember(userGroupCode, userInstitutionUid);
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
}
