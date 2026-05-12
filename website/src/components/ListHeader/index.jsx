import { Typography, Button, AutoComplete, Input, Select } from 'antd';
import './index.less'

const { Title } = Typography;

function ListHeader({ title, createButton, children }) {

  return (
    <div className='section-search-container'>
      <div className='title-header'>
        <Title>{title}</Title>
        {createButton}
      </div>
      <div className='search-input'>
        {children}
      </div>
    </div>
  );

}
ListHeader.Button = function ListHeaderButton({
  text,
  icon,
  onClick,
}) {
  return (
    <Button
      type="primary"
      icon={icon}
      onClick={onClick}
    >
      {text}
    </Button>
  );
};

ListHeader.Input = function ListHeaderInput({ autoCompleteProps, inputProps }) {
  return (
    <AutoComplete className='search-people-input' {...autoCompleteProps}>
      <Input.Search  {...inputProps} />
    </AutoComplete>
  );
};

ListHeader.Select = function ListHeaderSelect(props) {
  return (
    <Select className='local-select' {...props} />
  );
};
export default ListHeader;
