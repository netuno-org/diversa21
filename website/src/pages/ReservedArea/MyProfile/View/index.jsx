import usePeople from "../../../../common/usePeople.js";

import Profile from '../../../../components/Profile'

function ProfileView() {
  const people = usePeople();

  return (
      <div>
        <Profile user={people.data} />
      </div>
  );
}

export default ProfileView;
