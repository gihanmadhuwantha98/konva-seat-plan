import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image, Transformer, Rect, Group,Text } from "react-konva";
import WheelchairIcon from "../assets/icons/wheeleChair_red_1.svg"; // Import your SVG as a React component

const SeatPlan = () => {
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [seatCount, setSeatCount] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [seatImage, setSeatImage] = useState(null);
  const [groups, setGroups] = useState([]); // To store created groups
  const [newLabel, setNewLabel] = useState("");
  const [isCreatingSeats, setIsCreatingSeats] = useState(false); // State to track seat creation mode
  const [startPoint, setStartPoint] = useState(null);

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

  // Function to dynamically create seats based on user input
  const createSeats = () => {
    const newSeats = [];
    const seatWidth = 50;
    const seatHeight = 50;
    const gap = 20;

    for (let i = 0; i < seatCount; i++) {
      const seatId = i + 1;
      newSeats.push({
        id: `seat${i + 1}`,
        x: 50 + (seatWidth + gap) * i,
        y: 50,
        width: seatWidth,
        height: seatHeight,
        image: seatImage,
        seatType: "Standard",
        groupId: null, // Initially, seats are not grouped
        label: seatId,
      });
    }
    setSeats((prevSeats) => [...prevSeats, ...newSeats]);
  };

  // Function to group selected seats
  const groupSelectedSeats = () => {
    if (selectedSeatIds.length > 0) {
      const newGroupId = `group${groups.length + 1}`;
      const group = {
        id: newGroupId,
        seatIds: [...selectedSeatIds],
      };

      // Update seats with group ID
      const updatedSeats = seats.map((seat) =>
        selectedSeatIds.includes(seat.id)
          ? { ...seat, groupId: newGroupId }
          : seat
      );

      setSeats(updatedSeats);
      setGroups([...groups, group]);
      setSelectedSeatIds([]); // Clear selection after grouping
    }
  };

  // Function to ungroup selected seats
  const ungroupSelectedSeats = () => {
    if (selectedSeatIds.length > 0) {
      const updatedSeats = seats.map((seat) =>
        selectedSeatIds.includes(seat.id) ? { ...seat, groupId: null } : seat
      );

      setSeats(updatedSeats);

      // Remove groups that have no seats
      const updatedGroups = groups.filter(
        (group) =>
          !group.seatIds.every((seatId) => selectedSeatIds.includes(seatId))
      );

      setGroups(updatedGroups);
      setSelectedSeatIds([]); // Clear selection after ungrouping
    }
  };
  const updateSeatLabels = () => {
    const updatedSeats = seats.map((seat) =>
      selectedSeatIds.includes(seat.id)
        ? { ...seat, label: newLabel }
        : seat
    );

    setSeats(updatedSeats);
    setNewLabel(""); // Clear the input field after updating
  };

  // Function to start selection
  const handleMouseDown = (e) => {
    if (e.target !== stageRef.current) return;
  
    const { x, y } = stageRef.current.getPointerPosition();
  
    if (isCreatingSeats) {
      // Start creating seats: initialize start point for dragging
      setStartPoint({ x, y });
      setIsSelecting(true); // This will trigger seat creation on drag
    } else {
      // Start selection process
      setSelectionRect({ x, y, width: 0, height: 0 });
      setIsSelecting(true);
      setStartPoint({ x, y });
    }
  };
  
  // Function to handle mouse move event for both selection and seat creation
  // const handleMouseMove = (e) => {
  //   if (!isSelecting) return;
  
  //   const { x, y } = stageRef.current.getPointerPosition();
  //   const { x: startX, y: startY } = startPoint;
  
  //   if (isCreatingSeats) {
  //     // Seat creation logic
  //     const width = x - startX;
  
  //     if (width > 0) {
  //       const seatWidth = 50;
  //       const gap = 20;
  
  //       // Clear previous temporary seats
  //       setSeats((prevSeats) => prevSeats.filter((seat) => !seat.isTemporary));
  
  //       const newSeats = [];
  //       for (let i = 0; i * (seatWidth + gap) < width; i++) {
  //         newSeats.push({
  //           id: `tempSeat${Date.now()}-${i}`,
  //           x: startX + i * (seatWidth + gap),
  //           y: startY,
  //           width: seatWidth,
  //           height: seatWidth, // Assuming square seats
  //           image: seatImage,
  //           seatType: "Standard",
  //           groupId: null,
  //           label: `Temp ${i + 1}`,
  //           isTemporary: true, // Indicate that these seats are temporary
  //         });
  //       }
  //       setSeats((prevSeats) => [...prevSeats, ...newSeats]);
  //     }
  //   } else {
  //     // Selection logic: update selection rectangle
  //     setSelectionRect({
  //       x: startX,
  //       y: startY,
  //       width: x - startX,
  //       height: y - startY,
  //     });
  //   }
  // };
  const handleMouseMove = (e) => {
    if (!isSelecting) return;
  
    const { x, y } = stageRef.current.getPointerPosition();
    const { x: startX, y: startY } = startPoint;
  
    if (isCreatingSeats) {
      // Seat creation logic
      const width = x - startX;
  
      if (width > 0) {
        const seatWidth = 50;
        const gap = 20;
  
        // Clear previous temporary seats
        setSeats((prevSeats) => prevSeats.filter((seat) => !seat.isTemporary));
  
        const newSeats = [];
        for (let i = 0; i * (seatWidth + gap) < width; i++) {
          newSeats.push({
            id: `tempSeat${Date.now()}-${i}`,
            x: startX + i * (seatWidth + gap),
            y: startY,
            width: seatWidth,
            height: seatWidth, // Assuming square seats
            image: seatImage,
            seatType: "Standard",
            groupId: null,
            label: `Temp ${i + 1}`,
            isTemporary: true, // Indicate that these seats are temporary
          });
        }
        setSeats((prevSeats) => [...prevSeats, ...newSeats]);
      }
    } else {
      // Selection logic: update selection rectangle
      setSelectionRect({
        x: startX,
        y: startY,
        width: x - startX,
        height: y - startY,
      });
    }
  };
  
  
  // Function to handle mouse up event for both selection and seat creation
  // const handleMouseUp = () => {
  //   if (!isSelecting) return;
  
  //   if (isCreatingSeats) {
  //     // Finalize seat creation by marking temporary seats as permanent
  //     setSeats((prevSeats) =>
  //       prevSeats.map((seat) =>
  //         seat.isTemporary ? { ...seat, isTemporary: false } : seat
  //       )
  //     );
  //   } else {
  //     // Finalize selection
  //     const selectionBox = {
  //       x: selectionRect.x,
  //       y: selectionRect.y,
  //       width: selectionRect.width,
  //       height: selectionRect.height,
  //     };
  
  //     const selectedIds = seats
  //       .filter((seat) => {
  //         const seatRect = {
  //           x: seat.x,
  //           y: seat.y,
  //           width: seat.width,
  //           height: seat.height,
  //         };
  //         return rectsIntersect(selectionBox, seatRect);
  //       })
  //       .map((seat) => seat.id);
  
  //     setSelectedSeatIds(selectedIds);
  //   }
  
  //   // Reset states
  //   setIsSelecting(false);
  //   setStartPoint(null);
  // };

  const handleMouseUp = () => {
    if (!isSelecting) return;
  
    if (isCreatingSeats) {
      // Finalize seat creation by marking temporary seats as permanent
      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          seat.isTemporary ? { ...seat, isTemporary: false } : seat
        )
      );
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

  // Effect to update transformer when the selected seats change
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
  
  const handleStartCreatingSeats = () => {
    setIsCreatingSeats(true);
  };

  const handleStopCreatingSeats = () => {
    setIsCreatingSeats(false);
  };

  return (
    <div>
      {/* Input for seat count */}
      <div style={{ padding: "10px", textAlign: "center" }}>
        <input
          type="number"
          value={seatCount}
          onChange={(e) => setSeatCount(parseInt(e.target.value))}
          placeholder="Enter number of seats"
        />
        <button onClick={createSeats}>Create Seats</button>
        <button onClick={groupSelectedSeats}>Group Selected Seats</button>
        <button onClick={ungroupSelectedSeats}>Ungroup Selected Seats</button>
        <button onClick={handleStartCreatingSeats}>Start Creating Seats</button>
        <button onClick={handleStopCreatingSeats}>Stop Creating Seats</button>
        <div style={{ marginTop: "10px" }}>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Enter new label"
          />
          <button onClick={updateSeatLabels}>Update Labels</button>
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
            <Group key={group.id} draggable>
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
                      setSelectedSeatIds(seatIdsInSameGroup);
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
            />
          )}

          {/* Transformer for resizing and rotating */}
          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
    </div>
  );
};

export default SeatPlan;
