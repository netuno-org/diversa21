import { useState } from 'react';
import { Button } from 'antd';

import './index.less';

function TextExpander({ text, limit = 350 }) {
  const [expanded, setExpanded] = useState(false);

  const hasMoreText = text.length > limit;

  if (!hasMoreText) {
    return <span>{text}</span>;
  }

  return (
    <>
      <span>
        {expanded ? text : `${text.slice(0, limit)}...`}
      </span>

      <Button
        type="link"
        className="text-expander__toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Ver menos' : 'Ver mais'}
      </Button>
    </>
  );
}
export default TextExpander;