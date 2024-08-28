import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Image,
  Transformer,
  Rect,
  Group,
  Text,
} from "react-konva";
import WheelchairIcon from "../assets/icons/wheeleChair_red_1.svg"; // Import your SVG as a React component

const SeatPlan = () => {
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isCreatingSeats, setIsCreatingSeats] = useState(false);
  const [isSingleSelect, setisSingleSelect] = useState(false);
  const [gridVisible, setGridVisible] = useState(false);
  const [selectionRect, setSelectionRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [seatImage, setSeatImage] = useState(null);
  const [groups, setGroups] = useState([]); // To store created groups
  const [newLabel, setNewLabel] = useState("");
  const [startPoint, setStartPoint] = useState(null);
  const [activeTool, setActiveTool] = useState("select");
  const [isLabelLeftToRight, setIsLabelLeftToRight] = useState(true);
  const [startNumber, setStartNumber] = useState(1);

  const transformerRef = useRef(null);
  const stageRef = useRef(null);
  const layerRef = useRef(null);

  // Load the SVG directly as a base64 encoded string
  useEffect(() => {
    if (WheelchairIcon) {
      const image = new window.Image();
      image.src = WheelchairIcon;
      image.onload = () => setSeatImage(image);
    }
  }, []);

  //   useEffect(() => {
  //     const stage = stageRef.current;
  //     const transformer = transformerRef.current;

  //     if (selectedSeatIds.length > 0 && transformer && stage) {
  //       // Collect all selected nodes (including seats in the same group)
  //       const selectedNodes = [];

  //       selectedSeatIds.forEach((id) => {
  //         const seatNode = stage.findOne(`#${id}`);

  //         if (seatNode) {
  //           // Check if the seat belongs to a group
  //           const seat = seats.find((seat) => seat.id === id);
  //           if (seat && seat.groupId) {
  //             // Find all seats in the same group
  //             const groupSeats = seats.filter((s) => s.groupId === seat.groupId);

  //             // Add all seats in the group to the selected nodes
  //             groupSeats.forEach((groupSeat) => {
  //               const groupSeatNode = stage.findOne(`#${groupSeat.id}`);
  //               if (groupSeatNode) {
  //                 selectedNodes.push(groupSeatNode);
  //               }
  //             });
  //           } else {
  //             // Add individual seat node if it doesn't belong to a group
  //             selectedNodes.push(seatNode);
  //           }
  //         }
  //       });
  //       console.log(selectedNodes)
  //       if (selectedNodes.length > 1) {
  //         // Set the transformer to the selected nodes
  //         transformer.nodes(selectedNodes);
  //         transformer.getLayer().batchDraw();
  //       }if (selectedNodes.length > 0) {
  //         // Set the transformer to the selected nodes
  //         transformer.nodes(selectedNodes);
  //        // transformer.getLayer().batchDraw();
  //       } else {
  //        // transformer.detach();
  //        // transformer.getLayer().batchDraw();
  //       }
  //     }
  //      else {
  // //transformer.detach();
  //      // transformer.getLayer().batchDraw();
  //     }
  //   }, [selectedSeatIds, seats]);

  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;

    if (selectedSeatIds.length > 0 && transformer && stage) {
      const selectedNodes = selectedSeatIds.map((id) =>
        stage.findOne(`#${id}`)
      );
      transformer.nodes(selectedNodes);
      transformer.getLayer().batchDraw();
    } else {
      transformer.detach();
      transformer.getLayer().batchDraw();
    }
  }, [selectedSeatIds]);

  // Function to dynamically create seats based on user input

  // const createSeats = () => {
  //   const newSeats = [];
  //   const seatWidth = 50;
  //   const seatHeight = 50;
  //   const gap = 20;

  //   for (let i = 0; i < seatCount; i++) {
  //     const seatId = i + 1;
  //     newSeats.push({
  //       id: `seat${i + 1}`,
  //       x: 50 + (seatWidth + gap) * i,
  //       y: 50,
  //       width: seatWidth,
  //       height: seatHeight,
  //       image: seatImage,
  //       seatType: "Standard",
  //       groupId: null, // Initially, seats are not grouped
  //       label: seatId,
  //     });
  //   }
  //   setSeats((prevSeats) => [...prevSeats, ...newSeats]);
  // };

  // const groupSelectedSeats = () => {
  //   if (selectedSeatIds.length > 0) {
  //     const newGroupId = `group${groups.length + 1}`;
  //     const group = {
  //       id: newGroupId,
  //       seatIds: [...selectedSeatIds],
  //     };

  //     // Update seats with the new group ID
  //     const updatedSeats = seats.map((seat) => {
  //       if (selectedSeatIds.includes(seat.id)) {
  //         return { ...seat, groupId: newGroupId };
  //       }
  //       return seat;
  //     });

  //     // Check if the seats being grouped already belong to an existing group
  //     const existingGroups = groups.filter(
  //       (g) => !g.seatIds.every((seatId) => selectedSeatIds.includes(seatId))
  //     );

  //     // Set groups to include the new group, without duplicating existing groups
  //     setGroups([...existingGroups, group]);

  //     // Update seats state
  //     setSeats(updatedSeats);
  //     setSelectedSeatIds([]); // Clear selection after grouping
  //   }
  // };

  // Function to ungroup selected seats
  // const ungroupSelectedSeats = () => {
  //   if (selectedSeatIds.length > 0) {
  //     const updatedSeats = [...seats]; // Create a copy of the seats array to avoid direct state mutation

  //     // Loop through each seat and remove the groupId for selected seats
  //     updatedSeats.forEach((seat) => {
  //       if (selectedSeatIds.includes(seat.id)) {
  //         seat.groupId = null; // Remove the groupId

  //       }
  //     });

  //     // Update the seats state with the modified array
  //     setSeats(updatedSeats);

  //     // Remove groups that no longer have any seats
  //     const updatedGroups = groups.filter(
  //       (group) =>
  //         !group.seatIds.every((seatId) => selectedSeatIds.includes(seatId))
  //     );

  //     setGroups(updatedGroups);
  //     setSelectedSeatIds([]); // Clear selection after ungrouping
  //   }
  // };

  const updateSeatLabels = () => {
    const stage = stageRef.current;
  
    if (selectedSeatIds.length > 0 && stage) {
      const firstSeat = seats.find((seat) => selectedSeatIds.includes(seat.id));
      if (!firstSeat || !firstSeat.groupId) return;
  
      const groupSeats = seats.filter(
        (seat) => seat.groupId === firstSeat.groupId
      );
  
      let currentNumber = startNumber;
  
      const updatedSeats = groupSeats.map((seat, index) => {
        let newLabel;
        if (isLabelLeftToRight) {
          newLabel = `${currentNumber++}`;
        } else {
          newLabel = `${startNumber + groupSeats.length - 1 - index}`;
        }
        return { ...seat, label: newLabel };
      });
  
      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          seat.groupId === firstSeat.groupId
            ? updatedSeats.find((updatedSeat) => updatedSeat.id === seat.id)
            : seat
        )
      );
    }
  };
  
  

  const handleToggleLabelDirection = () => {
    if (selectedSeatIds.length === 0) return;
  
    const firstSeat = seats.find((seat) => selectedSeatIds.includes(seat.id));
    if (!firstSeat || !firstSeat.groupId) return;
  
    const groupSeats = seats.filter(
      (seat) => seat.groupId === firstSeat.groupId
    );
  
    // Store the current labels before changing direction
    const currentLabels = groupSeats.map((seat) => seat.label);
  
    // Reverse the order of the current labels
    const updatedSeats = groupSeats.map((seat, index) => ({
      ...seat,
      label: currentLabels[currentLabels.length - 1 - index], // Assign reversed labels
    }));
  
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        seat.groupId === firstSeat.groupId
          ? updatedSeats.find((updatedSeat) => updatedSeat.id === seat.id)
          : seat
      )
    );
  
    setIsLabelLeftToRight(!isLabelLeftToRight);
  
    // Log the current labels (optional)
    console.log("Current Labels (Reversed):", currentLabels.reverse());
  };
  
  const handleMouseDown = (e) => {
    if (e.target !== stageRef.current) return;

    const { x, y } = stageRef.current.getPointerPosition();

    if (activeTool === "draw") {
      // Start creating seats: initialize start point for dragging
      setStartPoint({ x, y });
      setIsSelecting(true);
      setIsCreatingSeats(true); // This will trigger seat creation on drag
    } else if (activeTool === "select") {
      // Start selection process
      setSelectionRect({ x, y, width: 0, height: 0 });
      setIsSelecting(true);
      setStartPoint({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isSelecting) return;

    const { x, y } = stageRef.current.getPointerPosition();
    const { x: startX, y: startY } = startPoint;

    if (activeTool === "draw") {
      const seatWidth = 50;
      const gap = 20;

      // Clear previous temporary seats
      setSeats((prevSeats) => prevSeats.filter((seat) => !seat.isTemporary));

      // Calculate the distance between the start and current mouse position
      const deltaX = x - startX;
      const deltaY = y - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Calculate the angle of movement
      const angle = Math.atan2(deltaY, deltaX); // This gives the angle in radians

      const newSeats = [];
      const numSeats = Math.floor(distance / (seatWidth + gap));

      for (let i = 0; i <= numSeats; i++) {
        const seatX = startX + i * (seatWidth + gap) * Math.cos(angle);
        const seatY = startY + i * (seatWidth + gap) * Math.sin(angle);

        // const label = isLabelLeftToRight ? `${i + 1}` : `${numSeats - i + 1}`;

        newSeats.push({
          id: `tempSeat-${Date.now()}-${i}`,
          x: seatX,
          y: seatY,
          width: seatWidth,
          height: seatWidth,
          image: seatImage,
          seatType: "Standard",
          groupId: null,
          label: i + 1,
          // label:label,
          isTemporary: true,
          draggable: false,
        });
      }

      setSeats((prevSeats) => [...prevSeats, ...newSeats]);
    } else if (activeTool === "select") {
      // Selection logic: update selection rectangle
      setSelectionRect({
        x: startX,
        y: startY,
        width: x - startX,
        height: y - startY,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;

    if (activeTool === "draw") {
      // Finalize seat creation by marking temporary seats as permanent
      const newSeats = seats.filter((seat) => seat.isTemporary);
      const updatedSeats = seats.map((seat) =>
        seat.isTemporary ? { ...seat, isTemporary: false } : seat
      );

      // If more than one seat was created, group them with a unique group ID
      if (newSeats.length > 1) {
        const newGroupId = `group${groups.length + 1}`;
        const group = {
          id: newGroupId,
          seatIds: newSeats.map((seat) => seat.id),
        };

        // Assign the groupId to the newly created seats
        const finalSeats = updatedSeats.map((seat) =>
          newSeats.some((newSeat) => newSeat.id === seat.id)
            ? { ...seat, groupId: newGroupId }
            : seat
        );

        setSeats(finalSeats);
        setGroups([...groups, group]);
      } else if (activeTool === "select") {
        // If only one seat was created, just update the seats without grouping
        setSeats(updatedSeats);
      }
    } else {
      // Finalize selection
      const selectionBox = {
        x: selectionRect.x,
        y: selectionRect.y,
        width: selectionRect.width,
        height: selectionRect.height,
      };

      const selectedIds = seats
        .filter((seat) => {
          const seatRect = {
            x: seat.x,
            y: seat.y,
            width: seat.width,
            height: seat.height,
          };
          return rectsIntersect(selectionBox, seatRect);
        })
        .map((seat) => seat.id);

      setSelectedSeatIds(selectedIds);
    }

    // Reset states
    setIsSelecting(false);
    setStartPoint(null);
  };

  // Function to check if two rectangles intersect
  const rectsIntersect = (r1, r2) => {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  };

  const deleteSelectedSeats = () => {
    const stage = stageRef.current;

    if (selectedSeatIds.length > 0 && stage) {
      // Get the groupId of the first selected seat (assuming all selected seats are from the same group)
      const firstSeat = seats.find((seat) => selectedSeatIds.includes(seat.id));
      if (!firstSeat || !firstSeat.groupId) return;

      const groupId = firstSeat.groupId;

      // Get all seats in the group
      const groupSeats = seats.filter((seat) => seat.groupId === groupId);

      // Sort group seats by their x-position (you can modify this if sorting by y-position is needed)
      const sortedGroupSeats = groupSeats.sort((a, b) => a.x - b.x);

      // Identify the index of the first selected seat in the sorted group
      const selectedSeatIndex = sortedGroupSeats.findIndex((seat) =>
        selectedSeatIds.includes(seat.id)
      );

      // Remove selected seats from the group
      const remainingSeats = sortedGroupSeats.filter(
        (seat) => !selectedSeatIds.includes(seat.id)
      );

      // Split the remaining seats into two groups based on the position of the deleted seat
      const leftGroup = remainingSeats.slice(0, selectedSeatIndex);
      const rightGroup = remainingSeats.slice(selectedSeatIndex);

      // Update the seats state with the new group IDs
      setSeats((prevSeats) =>
        prevSeats
          .filter((seat) => !selectedSeatIds.includes(seat.id)) // Remove the deleted seats
          .map((seat) => {
            if (leftGroup.some((leftSeat) => leftSeat.id === seat.id)) {
              return { ...seat, groupId: groupId }; // Left group keeps the original group ID
            } else if (
              rightGroup.some((rightSeat) => rightSeat.id === seat.id)
            ) {
              return { ...seat, groupId: `group-${Date.now()}` }; // Right group gets a new group ID
            }
            return seat;
          })
      );

      // Clear the selection
      setSelectedSeatIds([]);

      // Redraw the layer
      stage.batchDraw();
    }
  };

  const handleStartCreatingSeats = () => {
    setIsCreatingSeats(true);
  };

  const handleStopCreatingSeats = () => {
    setIsCreatingSeats(false);
  };

  const toggleGrid = () => {
    setGridVisible(!gridVisible);
  };
  const toggleSingleSelect = () => {
    setisSingleSelect(!isSingleSelect);
  };
  const createGrid = (stageWidth, stageHeight, gridSize = 20) => {
    const gridElements = [];
    for (let i = 0; i < stageWidth / gridSize; i++) {
      gridElements.push(
        <Rect
          key={`v-${i}`}
          x={i * gridSize}
          y={0}
          width={0.5}
          height={stageHeight}
          fill="gray"
        />
      );
    }

    for (let i = 0; i < stageHeight / gridSize; i++) {
      gridElements.push(
        <Rect
          key={`h-${i}`}
          x={0}
          y={i * gridSize}
          width={stageWidth}
          height={1}
          fill="gray"
        />
      );
    }

    return gridElements;
  };

  return (
    <div>
      {/* Input for seat count */}
      <div style={{ padding: "10px", textAlign: "center" }}>
        <div style={{ padding: "10px", textAlign: "center" }}>
          <button onClick={() => setActiveTool("draw")}>Draw Tool</button>
          <button onClick={() => setActiveTool("select")}>Select Tool</button>
          <button onClick={toggleGrid}>
            {gridVisible ? "Hide Grid" : "Show Grid"}
          </button>
          <button onClick={deleteSelectedSeats}>Delete</button>
          <button onClick={toggleSingleSelect}>Single Click</button>
          <button onClick={handleToggleLabelDirection}>
            Toggle Label Direction
          </button>
        </div>
        <div>
          <input
            type="number"
            value={startNumber}
            onChange={(e) => setStartNumber(parseInt(e.target.value))}
            placeholder="Enter starting number"
          />
          <button onClick={updateSeatLabels}>Set Starting Number</button>
        </div>
      </div>

      {/* Canvas for Seat Plan */}
      <Stage
        width={window.innerWidth}
        height={window.innerHeight - 100}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer ref={layerRef}>
          {/* Render groups */}
          {groups.map((group) => (
            <Group key={group.id} draggable={false}>
              {seats
                .filter((seat) => group.seatIds.includes(seat.id))
                .map((seat) => (
                  <Group key={seat.id} id={seat.id} draggable>
                    <Image
                      key={seat.id}
                      id={seat.id}
                      x={seat.x}
                      y={seat.y}
                      width={seat.width}
                      height={seat.height}
                      image={seat.image}
                      draggable={false}
                      onClick={() => {
                        // Find all seats with the same groupId and select them
                        const seatsInSameGroup = seats.filter(
                          (s) => s.groupId === seat.groupId
                        );
                        const seatIdsInSameGroup = seatsInSameGroup.map(
                          (s) => s.id
                        );
                        if (!isSingleSelect) {
                          setSelectedSeatIds(seatIdsInSameGroup);
                        } else {
                          setSelectedSeatIds([seat.id]);
                        }

                        console.log(`Group ID: ${seat.groupId}`); // Log group ID when seat is clicked
                      }}
                    />
                    <Text
                      x={seat.x + seat.width / 2}
                      y={seat.y + seat.height / 2}
                      text={seat.label}
                      fontSize={16}
                      fill="black"
                      offsetX={seat.width / 4} // Center the text
                      offsetY={8} // Adjust vertical centering
                      draggable={false}
                      onClick={() => {
                        // Find all seats with the same groupId and select them
                        const seatsInSameGroup = seats.filter(
                          (s) => s.groupId === seat.groupId
                        );
                        const seatIdsInSameGroup = seatsInSameGroup.map(
                          (s) => s.id
                        );

                        if (!isSingleSelect) {
                          setSelectedSeatIds(seatIdsInSameGroup);
                        } else {
                          setSelectedSeatIds([seat.id]);
                        }
                        console.log(`Group ID: ${seat.groupId}`); // Log group ID when seat is clicked
                      }}
                    />
                  </Group>
                ))}
            </Group>
          ))}

          {seats
            .filter((seat) => !seat.groupId)
            .map((seat) => (
              <Group key={seat.id} id={seat.id} draggable>
                <Image
                  key={seat.id}
                  id={seat.id}
                  x={seat.x}
                  y={seat.y}
                  width={seat.width}
                  height={seat.height}
                  image={seat.image}
                  draggable={false}
                  onClick={() => {
                    // If the seat has no groupId, just select this single seat
                    setSelectedSeatIds([seat.id]);
                    console.log(`Group ID: ${seat.groupId}`); // Log group ID when seat is clicked
                  }}
                />
                <Text
                  x={seat.x + seat.width / 2}
                  y={seat.y + seat.height / 2}
                  text={seat.label}
                  fontSize={16}
                  fill="black"
                  offsetX={seat.width / 4} // Center the text
                  offsetY={8} // Adjust vertical centering
                  draggable={false}
                />
              </Group>
            ))}

          {/* Selection Rectangle */}
          {isSelecting && (
            <Rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(0, 162, 255, 0.3)"
              stroke="blue"
              strokeWidth={1}
              custum={"wdwd"}
            />
          )}

          {/* Transformer for resizing and rotating */}
          <Transformer ref={transformerRef} />
        </Layer>
        <Layer>
          {/* Conditionally render grid */}
          {gridVisible &&
            createGrid(window.innerWidth, window.innerHeight - 100)}
        </Layer>
      </Stage>
    </div>
  );
};

export default SeatPlan;
