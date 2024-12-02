"use client"

import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Image from 'next/image';

const colors = ['rouge', 'vert', 'bleu', 'jaune'];
const blopImages = colors.flatMap(color =>
    [1, 2, 3].map(num => ({ id: `blop${num}_${color}`, src: `/blop${num}_${color}.png` }))
);

const createInitialState = () => {
    return {
        images: blopImages.map(blop => blop.id),
        cases: Array(24).fill(null), // Chaque case contient une seule image ou null
    };
};

const Damier = () => {
    const [state, setState] = React.useState(createInitialState());

    const onDragEnd = (result: any) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceId = source.droppableId;
        const destId = destination.droppableId;

        if (sourceId === 'images' && destId.startsWith('case')) {
            const caseIndex = parseInt(destId.replace('case', ''));
            if (state.cases[caseIndex]) return; // Case déjà occupée

            const draggedItemId = state.images[source.index];

            setState(prevState => ({
                ...prevState,
                cases: prevState.cases.map((caseItem, index) =>
                    index === caseIndex ? draggedItemId : caseItem
                ),
            }));
        } else if (sourceId.startsWith('case') && destId.startsWith('case')) {
            const sourceCaseIndex = parseInt(sourceId.replace('case', ''));
            const destCaseIndex = parseInt(destId.replace('case', ''));

            if (state.cases[destCaseIndex]) return; // Case destination déjà occupée

            setState(prevState => {
                const newCases = [...prevState.cases];
                newCases[destCaseIndex] = newCases[sourceCaseIndex];
                newCases[sourceCaseIndex] = null;
                return { ...prevState, cases: newCases };
            });
        }
    };

    const removeImageFromCase = (caseIndex: number) => {
        setState(prevState => ({
            ...prevState,
            cases: prevState.cases.map((caseItem, index) =>
                index === caseIndex ? null : caseItem
            ),
        }));
    };

    const resetDamier = () => {
        setState(createInitialState());
    };

    return (
        <>
            <button
                onClick={resetDamier}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                Réinitialiser
            </button>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="mb-4">
                    <Droppable droppableId="images" direction="horizontal">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="flex flex-wrap justify-center gap-4"
                            >
                                {state.images.map((id, index) => (
                                    <Draggable key={id+index} draggableId={id+index} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="w-16 h-16"
                                            >
                                                <Image src={`/${id}.png`} alt={id} width={64} height={64} />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
                <div className="grid grid-cols-6 gap-8">
                    {state.cases.map((caseItem, index) => (
                        <Droppable key={`case${index}`} droppableId={`case${index}`}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="w-16 h-16 border border-gray-300 flex items-center justify-center relative"
                                >
                                    {caseItem && (
                                        <>
                                            <Draggable key={caseItem} draggableId={caseItem} index={0}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="w-full h-full relative"
                                                    >
                                                        <Image src={`/${caseItem}.png`} alt={caseItem} width={64} height={64} />
                                                        <button
                                                            onClick={() => removeImageFromCase(index)}
                                                            className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        </>
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </>
    );
};

export default Damier;
