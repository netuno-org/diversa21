import Replies from "../ReservedArea/Replies";

function ReplyPage({ topicUid }) {
  return (
    <div>
      <Replies topicUid={topicUid} />
    </div>
  );
}

export default ReplyPage;
