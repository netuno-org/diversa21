import { connect } from 'react-redux';

import Profile from '../../../../components/Profile'

function ProfileView({ loggedUserInfo }) {

  return (
      <div>
        <Profile user={loggedUserInfo} />
      </div>
  );
}

const mapStateToProps = store => {
  const { loggedUserInfo } = store.loggedUserInfoState;
  return {
    loggedUserInfo
  };
};

export default connect(mapStateToProps, {})(ProfileView);
