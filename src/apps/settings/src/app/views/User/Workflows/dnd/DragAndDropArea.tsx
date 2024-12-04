import { FC, memo, useCallback, useContext, useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import { Box } from "@mui/material";
import * as WorkflowStatus from "../constants";
import { StatusLabel } from "../StatusLabel";
import { Draggable } from "./Draggable";
import { WorkflowContext } from "../WorkflowsContext";

export interface ContainerState {
  cards: any[];
}

type DragAndDropAreaProps = {
  listData: WorkflowStatus.StatusLabelProps[];
};

export const DragAndDropArea: FC<DragAndDropAreaProps> = memo(
  function Container({ listData }) {
    const [cards, setCards] = useState(listData);

    const { openStatusLabelForm } = useContext(WorkflowContext);

    const findCard = useCallback(
      (id: string) => {
        const card = cards.find((c: any) => `${c.sort}` === id);
        return { card, index: cards.indexOf(card) };
      },
      [cards]
    );

    const moveCard = useCallback(
      (id: string, atIndex: number) => {
        const { card, index } = findCard(id);
        const updatedCards = [...cards];
        updatedCards.splice(index, 1);
        updatedCards.splice(atIndex, 0, card);
        setCards(updatedCards);
      },
      [findCard, cards]
    );

    const [, drop] = useDrop(() => ({ accept: "drag-card" }));

    const handleOnEditClicked = (data: WorkflowStatus.StatusLabelProps) => {
      return () => {
        openStatusLabelForm(data);
      };
    };
    const handleOnDeleteClicked = () => {
      return () => {
        alert("deleteStatusLabel");
      };
    };

    useEffect(() => {
      setCards(listData);
    }, [listData]);

    return (
      <>
        <Box
          ref={drop}
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {cards.map((card: any) => (
            <Box key={card.sort} px={4} py={1}>
              <Draggable
                id={`${card.sort}`}
                moveCard={moveCard}
                findCard={findCard}
              >
                <StatusLabel
                  key={card.sort}
                  draggable={true}
                  data={card}
                  onEdit={handleOnEditClicked(card)}
                  onDelete={handleOnDeleteClicked()}
                />
              </Draggable>
            </Box>
          ))}
        </Box>
      </>
    );
  }
);
