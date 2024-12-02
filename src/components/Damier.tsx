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
const colorLastDuplicate = "bg-gray-500";
const colorDuplicate = "bg-white";

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

    const getDuplicateImages = (cases: Array<string | null>) => {
        const occurrences: Record<string, number> = {};
        cases.forEach((caseItem) => {
            if (caseItem) occurrences[caseItem] = (occurrences[caseItem] || 0) + 1;
        });
        return Object.keys(occurrences).filter((key) => occurrences[key] > 1);
    };

    const getLastDuplicate = (cases: Array<string | null>, duplicates: string[]) => {
        // On parcourt les cases de droite à gauche pour trouver la dernière image doublon
        for (let i = cases.length - 1; i >= 0; i--) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            if (cases[i] && duplicates.includes(cases[i])) {
                return cases[i]; // Retourne le dernier doublon trouvé
            }
        }
        return null; // Aucun doublon trouvé
    };

    // Identifie les doublons
    const duplicates = getDuplicateImages(state.cases);
    // Identifie le dernier doublon placé
    const lastDuplicate = getLastDuplicate(state.cases, duplicates);
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
                                    <Draggable key={id + index} draggableId={id + index} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`w-16 h-16 ${
                                                    duplicates.includes(id)
                                                        ? id === lastDuplicate
                                                            ? colorLastDuplicate
                                                            : colorDuplicate
                                                        : ''
                                                }`}
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
                                                        className={`w-full h-full relative ${
                                                            duplicates.includes(caseItem)
                                                                ? caseItem === lastDuplicate
                                                                    ? colorLastDuplicate
                                                                    : colorDuplicate
                                                                : ''
                                                        }`}
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