import { useState } from "react";

import AddButton from "../AddButton/index";
import PopupCard from "../popup-card/index";

const Popup = ({ closePop, title, children, onAddHandler }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  return (
    <>
      <AddButton onAddHandler={() => setIsPopupOpen(true)} />
      {isPopupOpen && (
        <PopupCard
          onCancelHandler={() => setIsPopupOpen(false)}
          onAddHandler={onAddHandler}
          title={title}
        >
          {children}
        </PopupCard>
      )}
    </>
  );
};

export default Popup;
