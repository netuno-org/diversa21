import ProfileForm from "../../../../components/ProfileForm"

import usePeople from "../../../../common/usePeople.js";

function ProfileEdit() {
  const people = usePeople();

  return (
    <ProfileForm people={people.data} reload={people.reload} me={true}/>
  );
}

export default ProfileEdit;
