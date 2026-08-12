import TopicPage from "../TopicPage";

function CategoryPage({ categoryUid }) {
  return (
    <div>
      <TopicPage categoryUid={categoryUid} />
    </div>
  );
}

export default CategoryPage;
