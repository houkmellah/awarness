import Debugger from '../../debugger';
import RewriteNote from '../rewriteNote';

const EditNote = ({ note, onClose, refetch }) => {
  const handleRewrite = (newText) => {
    form.setFieldValue('note', newText);
  };
  
  return (
    <Group position="right" mt="md">
      <RewriteNote note={note} onRewrite={handleRewrite} />
    </Group>
  );
};

export default EditNote; 