import people from "#core/lib/people.js";

const peopleUid = people.getLogged().getUID("uid");
const data = people.getData(peopleUid);

const loggedUserGroupCode = data.getValues("group").getString("code");
const loggedUserInstitutionUid = data.getValues("institution").getUID("uid");

export default {
  canCreateAnyUser: () => {
    return loggedUserGroupCode === "super-admin"; 
  },
  // canManageUser: (people) => {
  //   return (
  //     (
  //       loggedUserGroupCode === "management" && 
  //       people.group.code === "member" &&
  //       loggedUserInstitutionUid === people.institution.uid
  //     ) || (
  //       loggedUserGroupCode === "super-admin"
  //     )
  //   );
  // },
  // canChangeUserGroup: () => {
  //   return loggedUserGroupCode === "super-admin"; 
  // },
  // canChangeUserInstitution: () => {
  //   return loggedUserGroupCode === "super-admin"; 
  // },
  // canChangeOwnInstitution: () => {
  //   return loggedUserGroupCode === "super-admin"; 
  // },
  canCreateMember: (newMemberGroupCode, institutionUid) => {
    return (
      (
        loggedUserGroupCode === "super-admin"
      ) || (
        loggedUserGroupCode === "management" &&
        loggedUserInstitutionUid.equals(institutionUid) &&
        newMemberGroupCode === "member" 
      )
    );
  },
  // canManageInstitution: (institution) => {
  //   return (
  //     (
  //       loggedUserGroupCode === "super-admin"
  //     ) || (
  //       loggedUserGroupCode === "management" && 
  //       loggedUserInstitutionUid === institution.uid
  //     )
  //   );
  // },
  // canCreateInstitutions: () => {
  //   return loggedUserGroupCode === "super-admin"; 
  // },
  // canManagePosts: () => {
  //   return loggedUserGroupCode === "review"; 
  // },
}
