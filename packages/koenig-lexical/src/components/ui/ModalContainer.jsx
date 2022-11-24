// Portal container that can be used to render floating elements, outside of the editor
import {createPortal} from 'react-dom';

const ModalContainer = ({component, container}) => {
    const portalContainer = container || null;

    if (!portalContainer) {
        return null;
    }

    return createPortal(component, portalContainer);
};

export default ModalContainer;
