import { connect } from 'react-redux';

import Profile from '../../../../components/Profile'

import './index.less';

function ProfileView({ loggedUserInfo }) {

  return (
      <div className="profile-view">
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
