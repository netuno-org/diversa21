import ProfileForm from "../../../../components/ProfileForm"

import usePeople from "../../../../common/usePeople.js";

function ProfileEdit() {
  const people = usePeople();

  return (
    <ProfileForm people={people.data} />
  );
}

export default ProfileEdit;
