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
import WheelchairIcon from "../assets/icons/wheeleChair_red_1.svg";
import LeftCombineSeat from "../assets/icons/leftCombineSeat.svg";
import RightCombineSeat from "../assets/icons/rightCombineSeat.svg";
import MiddleCombineSeat from "../assets/icons/middleCombineSeat.svg";
import GroupNameEditor from "./GroupNameEditor";

const SeatPlan = () => {
  const [seats, setSeats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTool, setActiveTool] = useState("select");
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  const [selectionRect, setSelectionRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [seatImage, setSeatImage] = useState(null);
  const [leftCombineSeatImage, setLeftCombineSeatImage] = useState(null);
  const [middleombineSeatImage, setMiddleCombineSeatImage] = useState(null);
  const [rightCombineSeatImage, setRightCombineSeatImage] = useState(null);
  const [startPoint, setStartPoint] = useState(null);

  const [isLabelLeftToRight, setIsLabelLeftToRight] = useState(true);
  const [startNumber, setStartNumber] = useState(1);
  const [seatCountInput, setSeatCountInput] = useState("");
  const [spacingInput, setSpacingInput] = useState("");
  const [seatSpacing, setSeatSpacing] = useState(0);
  const [gridVisible, setGridVisible] = useState(false);
  const [groupLabels, setGroupLabels] = useState({});
  const [activeGroup, setActiveGroup] = useState(null);
  const [labelDirection, setLabelDirection] = useState("both");
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

    if (LeftCombineSeat) {
      const image = new window.Image();
      image.src = LeftCombineSeat;
      image.onload = () => setLeftCombineSeatImage(image);
    }

    if (MiddleCombineSeat) {
      const image = new window.Image();
      image.src = MiddleCombineSeat;
      image.onload = () => setMiddleCombineSeatImage(image);
    }
    if (RightCombineSeat) {
      const image = new window.Image();
      image.src = RightCombineSeat;
      image.onload = () => setRightCombineSeatImage(image);
    }
  }, []);

  useEffect(() => {
    setSpacingInput(seatSpacing);
  }, [seatSpacing]);

  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;

    if (!transformer || !stage) return;

    const selectedSeats = selectedSeatIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((node) => node);
    const selectedGroups = groups.filter((group) =>
      selectedSeatIds.some((seatId) => group.seatIds.includes(seatId))
    );

    const selectedGroupNodes = selectedGroups
      .map((group) => stage.findOne(`#group-${group.id}`))
      .filter((node) => node);
    if (selectedSeatIds.length > 0) {
      if (activeTool === "singleSelect") {
        const singleSelectedNode = selectedSeats[0];
        if (singleSelectedNode) {
          transformer.nodes([singleSelectedNode]);
          transformer.enabledAnchors([]);
          transformer.rotateEnabled(false);
          transformer.draggable(false);
        } else {
          transformer.detach();
        }
      } else {
        const selectedNodes = [...selectedGroupNodes];
        if (selectedNodes.length > 0) {
          transformer.nodes(selectedNodes);
          transformer.enabledAnchors([]);
          transformer.rotateEnabled(true);
          transformer.draggable(true);
        } else {
          transformer.detach();
        }
      }

      transformer.getLayer().batchDraw();
    } else {
      transformer.detach();
    }

    // Detach the transformer on empty space click in single select mode
    const handleStageClick = (e) => {
      if (activeTool === "singleSelect" && e.target === stage) {
        setSelectedSeatIds([]);
        transformer.detach();
        transformer.getLayer().batchDraw();
      }
    };

    stage.on("click", handleStageClick);
    return () => {
      stage.off("click", handleStageClick);
    };
  }, [selectedSeatIds, groups, activeTool]);

  const handleMouseDown = (e) => {
    if (e.target !== stageRef.current) return;

    const { x, y } = stageRef.current.getPointerPosition();

    if (activeTool === "draw") {
      setStartPoint({ x, y });
    } else if (activeTool === "select") {
      setStartPoint({ x, y });
      setSelectionRect({ x, y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = stageRef.current.getPointerPosition();

    if (activeTool === "draw" && startPoint) {
      const { x: startX, y: startY } = startPoint;
      const seatWidth = 50;
      const gap = 20;

      // Calculate the distance and angle of movement
      const deltaX = x - startX;
      const deltaY = y - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const angle = Math.atan2(deltaY, deltaX);

      // Determine the number of seats to create
      const numSeats = Math.floor(distance / (seatWidth + gap));

      // Create new temporary seats based on the current drag position
      const newSeats = Array.from({ length: numSeats + 1 }, (_, i) => ({
        id: `tempSeat-${Date.now()}-${i}`,
        x: startX + i * (seatWidth + gap) * Math.cos(angle),
        y: startY + i * (seatWidth + gap) * Math.sin(angle),
        width: seatWidth,
        height: seatWidth,
        image: seatImage,
        seatType: "Standard",
        groupId: null,
        label: i + 1,
        isTemporary: true,
        draggable: false,
      }));

      // Update the state with the new temporary seats
      setSeats((prevSeats) => [
        ...prevSeats.filter((seat) => !seat.isTemporary),
        ...newSeats,
      ]);
    }

    if (activeTool === "select" && startPoint) {
      const { x: startX, y: startY } = startPoint;

      // Update the selection rectangle based on the current drag position
      setSelectionRect({
        x: startX,
        y: startY,
        width: x - startX,
        height: y - startY,
      });
    }
  };

  const handleMouseUp = () => {
    if (!startPoint) return;

    if (activeTool === "draw") {
      // Generate new IDs for temporary seats and finalize them
      const updatedSeats = seats.map((seat) => {
        if (seat.isTemporary) {
          return {
            ...seat,
            id: `seat-${Math.random()}`, // Assign a new unique ID
            isTemporary: false,
          };
        }
        return seat;
      });

      // If more than one seat was created or single seat should be grouped, group them with a unique group ID
      const newSeats = updatedSeats.filter((seat) => seat.groupId === null);
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
      setGroups((prevGroups) => [...prevGroups, group]);
    }

    if (activeTool === "select") {
      // Normalize the selection rectangle
      const normalizedSelectionBox = {
        x: Math.min(selectionRect.x, selectionRect.x + selectionRect.width),
        y: Math.min(selectionRect.y, selectionRect.y + selectionRect.height),
        width: Math.abs(selectionRect.width),
        height: Math.abs(selectionRect.height),
      };

      // Find all seats that intersect with the selection rectangle
      const selectedIds = new Set();
      let activeGroup = null;

      seats.forEach((seat) => {
        const seatRect = {
          x: seat.x,
          y: seat.y,
          width: seat.width,
          height: seat.height,
        };
        if (rectsIntersect(normalizedSelectionBox, seatRect)) {
          // If a seat intersects, add all seats in the same group to the selected IDs
          if (seat.groupId) {
            seats
              .filter((s) => s.groupId === seat.groupId)
              .forEach((s) => selectedIds.add(s.id));
            setSpacingInput(getSeatSpacingInGroup(seat.groupId));

            // Set the active group if it's not already set
            if (!activeGroup) {
              activeGroup = groups.find((group) => group.id === seat.groupId);
              setActiveGroup(activeGroup);
            }
          } else {
            selectedIds.add(seat.id);
          }
        }
      });

      setSelectedSeatIds(Array.from(selectedIds));
    }

    setStartPoint(null);
    setSelectionRect(null);
  };

  const deleteSelectedSeats = () => {
    const stage = stageRef.current;

    if (selectedSeatIds.length > 0 && stage) {
      const firstSeat = seats.find((seat) => selectedSeatIds.includes(seat.id));
      if (!firstSeat || !firstSeat.groupId) return;

      const groupId = firstSeat.groupId;

      // Get all seats in the group
      const groupSeats = seats.filter((seat) => seat.groupId === groupId);

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

  // const handleIncreaseSpacing = () => updateSeatSpacing(5);
  // const handleDecreaseSpacing = () => updateSeatSpacing(-5);

  // const updateSeatSpacing = (adjustment) => {
  //   const stage = stageRef.current;
  //   const transformer = transformerRef.current;

  // setSeats((prevSeats) => {
  //   const firstSeat = prevSeats.find((seat) =>
  //     selectedSeatIds.includes(seat.id)
  //   );
  //   if (!firstSeat || !firstSeat.groupId) return prevSeats;

  //   const groupSeats = prevSeats.filter(
  //     (seat) => seat.groupId === firstSeat.groupId
  //   );

  //   // Calculate current spacing
  //   const currentSpacing =
  //     groupSeats.length > 1
  //       ? groupSeats[1].x - groupSeats[0].x - groupSeats[0].width
  //       : 0;

  //   // Calculate new spacing and ensure it's not below 0
  //   const newSpacing = Math.max(currentSpacing + adjustment, 0);

  //   // Update positions based on new spacing
  //   const updatedSeats = groupSeats.map((seat, index) => {
  //     const newX = groupSeats[0].x + index * (seat.width + newSpacing);
  //     return { ...seat, x: newX };
  //   });

  //   // Update the seat spacing state
  //   setSeatSpacing(Math.round(newSpacing));

  //   // Update the seat state with new positions
  //   return prevSeats.map((seat) =>
  //     seat.groupId === firstSeat.groupId
  //       ? updatedSeats.find((updatedSeat) => updatedSeat.id === seat.id)
  //       : seat
  //   );
  // });

  // Ensure the transformer box is updated

  // };
  const handleSeatSpaceInputChange = (e) => {
    const newSpacing = Math.max(Number(e.target.value) || 0, 0);
    setSpacingInput(newSpacing);
    setSeatSpacing(newSpacing);
    updateSeatSpacing(newSpacing);
  };
  // const handleSeatCountChange = (e) => {
  //   const newSeatCount = Math.max(Number(e.target.value) || 0, 0);
  //   // console.log(newSeatCount)
  //   setSeatCountInput(newSeatCount);
  //   updateSeatCount(newSeatCount);
  // };

  const updateSeatSpacing = (newSpacing) => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;

    setSeats((prevSeats) => {
      const firstSeat = prevSeats.find((seat) =>
        selectedSeatIds.includes(seat.id)
      );
      if (!firstSeat || !firstSeat.groupId) return prevSeats;

      const groupSeats = prevSeats.filter(
        (seat) => seat.groupId === firstSeat.groupId
      );

      // Calculate new positions based on the user-defined spacing
      const updatedSeats = groupSeats.map((seat, index) => {
        const newX = groupSeats[0].x + index * (seat.width + newSpacing);
        return { ...seat, x: newX };
      });

      return prevSeats.map((seat) =>
        seat.groupId === firstSeat.groupId
          ? updatedSeats.find((updatedSeat) => updatedSeat.id === seat.id)
          : seat
      );
    });

    // Ensure the transformer box is updated
    setTimeout(() => {
      const selectedNodes = selectedSeatIds.map((id) =>
        stage.findOne(`#${id}`)
      );
      transformer.nodes(selectedNodes);
      transformer.getLayer().batchDraw();
    }, 0);
  };
  const updateSeatCount = (newSeatCount) => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;

    setSeats((prevSeats) => {
      // Find the first seat in the selected group
      const firstSeat = prevSeats.find((seat) =>
        selectedSeatIds.includes(seat.id)
      );
      if (!firstSeat || !firstSeat.groupId) return prevSeats;

      const groupSeats = prevSeats.filter(
        (seat) => seat.groupId === firstSeat.groupId
      );

      const currentSeatCount = groupSeats.length;
      let updatedSeats = [...groupSeats];

      // Add new seats if needed
      if (newSeatCount > currentSeatCount) {
        for (let i = currentSeatCount; i < newSeatCount; i++) {
          const newX = groupSeats[0].x + i * (firstSeat.width + seatSpacing);
          updatedSeats.push({
            ...firstSeat,
            id: `seat-${Date.now()}-${i}`, // Ensure unique IDs
            x: newX,
          });
        }
      }
      // Remove seats if needed
      else if (newSeatCount < currentSeatCount) {
        updatedSeats = updatedSeats.slice(0, newSeatCount);
      }

      // Create a map for updated seats
      const updatedSeatsMap = new Map(
        updatedSeats.map((seat) => [seat.id, seat])
      );

      // Combine existing seats with updated seats
      const combinedSeats = prevSeats.map((seat) =>
        seat.groupId === firstSeat.groupId
          ? updatedSeatsMap.get(seat.id) || seat
          : seat
      );

      // Add any new seats that were not in prevSeats
      const newSeats = updatedSeats.filter(
        (seat) => !prevSeats.some((prevSeat) => prevSeat.id === seat.id)
      );

      return [...combinedSeats, ...newSeats];
    });

    // Ensure the transformer box is updated
    setTimeout(() => {
      const selectedNodes = selectedSeatIds
        .map((id) => stage.findOne(`#${id}`))
        .filter(Boolean); // Ensure nodes are valid

      transformer.nodes(selectedNodes);
      transformer.getLayer().batchDraw();
    }, 0);
  };

  const combineSeats = () => {
    setSeats((prevSeats) => {
      const selectedSeats = prevSeats.filter((seat) =>
        selectedSeatIds.includes(seat.id)
      );
      if (selectedSeats.length < 2) return prevSeats;

      const firstSeat = selectedSeats[0];
      const lastSeat = selectedSeats[selectedSeats.length - 1];

      // Calculate positions for the middle seats and set images
      const updatedSeats = prevSeats.map((seat) => {
        if (selectedSeatIds.includes(seat.id)) {
          if (seat.id === firstSeat.id) {
            return {
              ...seat,
              x: firstSeat.x,
              y: firstSeat.y,
              image: leftCombineSeatImage,
            };
          } else if (seat.id === lastSeat.id) {
            return {
              ...seat,
              x: lastSeat.x,
              y: firstSeat.y,
              image: rightCombineSeatImage,
            };
          } else {
            return { ...seat, image: middleombineSeatImage, y: firstSeat.y };
          }
        }
        return seat;
      });

      return updatedSeats;
    });

    // Ensure the transformer box is updated
    setTimeout(() => {
      const selectedNodes = selectedSeatIds.map((id) =>
        stageRef.current.findOne(`#${id}`)
      );
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer().batchDraw();
    }, 0);
    updateSeatSpacing(0);
    setSeatSpacing(0);
  };

  const toggleGrid = () => {
    setGridVisible(!gridVisible);
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

  const exportToJson = () => {
    const jsonData = JSON.stringify(seats, null, 2);
    console.log(jsonData); // You can log it, send it to a server, or download it
  };
  const getSeatSpacingInGroup = (groupId) => {
    const seatsInGroup = seats.filter((seat) => seat.groupId === groupId);

    if (seatsInGroup.length < 2) {
      return 0;
    }

    // Sort seats by their x-coordinate for horizontal spacing
    const sortedSeats = seatsInGroup.sort((a, b) => a.x - b.x);

    // Calculate the horizontal spacing between each pair of adjacent seats
    const spacings = [];
    for (let i = 1; i < sortedSeats.length; i++) {
      const spacing =
        sortedSeats[i].x - (sortedSeats[i - 1].x + sortedSeats[i - 1].width);
      spacings.push(spacing);
    }
    const averageSpacing =
      spacings.reduce((a, b) => a + b, 0) / spacings.length;
    return parseFloat(averageSpacing.toFixed(1));
  };

  const updateGroupLabels = (groupId, position, text) => {
    setGroupLabels((prevLabels) => ({
      ...prevLabels,
      [groupId]: {
        ...prevLabels[groupId],
        [position]: text,
      },
    }));
  };

  // const handleAddSeat = () => {
  //   // Ensure there is an active group
  //   if (!activeGroup) return;
  // console.log(activeGroup)
  //   const { id: selectedGroupId, seats: seatContainer= [], space } = activeGroup;
  //   const seatCount = seatContainer.length;
  //   console.log('Count',seatCount)
  // console.log('id',selectedGroupId)
  // console.log('seats',seatContainer)
  // console.log('space',space)
  //   // Calculate new seat position based on existing seat positions
  //   const lastSeat = seatContainer[seatCount - 1];
  //   const seatWidth = lastSeat.width;
  //   const seatHeight = lastSeat.height;

  //   const newX = lastSeat
  //     ? lastSeat.x + seatWidth + space
  //     : 0;
  // console.log('newx',newX)
  //   // Create a new seat
  //   const newSeat = {
  //     id: `seat-${seatCount + 1}`,
  //     x: newX,
  //     y: 0,
  //     width: seatWidth,
  //     height: seatHeight,
  //   };

  //   // Update the group with the new seat
  //   const updatedGroups = groups.map(group =>
  //     group.id === selectedGroupId
  //       ? { ...group, seats: [...seatContainer, newSeat] }
  //       : group
  //   );

  //   // Update the state with the new group configuration
  //   setGroups(updatedGroups);

  //   // Reposition labels after adding a new seat
  //   updatedGroups.forEach(group => {
  //     if (group.id === selectedGroupId) {
  //       if (typeof group.positionLabels === 'function') {
  //         group.positionLabels();
  //       }
  //     }
  //   });

  //   // Redraw the transformer if necessary
  //   const transformer = transformerRef.current;
  //   if (transformer) {
  //     const stage = stageRef.current;
  //     if (stage) {
  //       const selectedNodes = seatContainer.map(seat => stage.findOne(`#${seat.id}`)).filter(Boolean);
  //       transformer.nodes(selectedNodes);
  //       transformer.getLayer().batchDraw();
  //     }
  //   }
  // };

  const handleSeatOnClick = (seat) => {
    const groupId = seat.groupId;

    if (activeTool === "select") {
      if (groupId) {
        // If the seat has a group ID, select all seats in the same group
        const seatsInSameGroup = seats.filter((s) => s.groupId === groupId);
        const seatIdsInSameGroup = seatsInSameGroup.map((s) => s.id);

        setSelectedSeatIds(seatIdsInSameGroup);
        setSpacingInput(getSeatSpacingInGroup(groupId));
      } else {
        // If no group ID, just select the clicked seat
        setSelectedSeatIds([seat.id]);
      }
    } else if (activeTool === "singleSelect") {
      // If the active tool is 'singleSelect', only select the clicked seat
      setSelectedSeatIds([seat.id]);
    }
  };

  const handleGroupOnClick = (group) => {
    if (activeTool === "select") setActiveGroup(group);
  };
  const handleUpdateSeats = (newSeatCount) => {
    if (!selectedSeatIds.length) return;

    // Find the first selected seat's group
    const selectedSeat = seats.find((seat) =>
      selectedSeatIds.includes(seat.id)
    );
    if (!selectedSeat) return;

    const selectedGroupId = selectedSeat.groupId;
    console.log(selectedGroupId);
    setGroups((prevGroups) => {
      return prevGroups.map((group) => {
        if (group.id !== selectedGroupId) return group;

        const updatedSeats = [...group.seats];
        const seatCount = updatedSeats.length;

        if (newSeatCount > seatCount) {
          // Add new seats
          const lastSeat = updatedSeats[seatCount - 1];
          const seatWidth = lastSeat.width;
          const seatHeight = lastSeat.height;
          const newSeats = [];

          for (let i = seatCount; i < newSeatCount; i++) {
            const newX =
              lastSeat.x + (i - seatCount + 1) * (seatWidth + group.space);
            newSeats.push({
              id: `seat-${Date.now()}-${i}`,
              x: newX,
              y: lastSeat.y,
              width: seatWidth,
              height: seatHeight,
              groupId: selectedGroupId,
            });
          }
          updatedSeats.push(...newSeats);
        } else if (newSeatCount < seatCount) {
          // Remove excess seats
          updatedSeats.splice(newSeatCount, seatCount - newSeatCount);
        }

        return { ...group, seats: updatedSeats };
      });
    });

    setSeats((prevSeats) => {
      const filteredSeats = prevSeats.filter(
        (seat) => seat.groupId !== selectedGroupId
      );
      const newSeats = filteredSeats.concat(
        groups.find((group) => group.id === selectedGroupId).seats
      );
      return newSeats;
    });

    // Ensure the transformer updates its selection
    const transformer = transformerRef.current;
    if (transformer) {
      setTimeout(() => {
        const stage = stageRef.current;
        const selectedNodes = selectedSeatIds
          .map((id) => stage.findOne(`#${id}`))
          .filter(Boolean);

        transformer.nodes(selectedNodes);
        transformer.getLayer().batchDraw();
      }, 0);
    }
  };

  const handleAddSeat = () => {
    const newSeatCount = parseInt(seatCountInput, 10);
    if (!isNaN(newSeatCount) && newSeatCount > 0) {
      handleUpdateSeats(newSeatCount);
    }
  };

  const handleRemoveSeat = () => {
    const newSeatCount = parseInt(seatCountInput, 10);
    if (!isNaN(newSeatCount) && newSeatCount >= 0) {
      handleUpdateSeats(newSeatCount);
    }
  };

  return (
    <div>
      <div style={{ padding: "10px", textAlign: "center" }}>
        <div style={{ padding: "10px", textAlign: "center" }}>
          <button onClick={() => setActiveTool("draw")}>Draw Tool</button>
          <button onClick={() => setActiveTool("select")}>Select Tool</button>
          <button onClick={() => setActiveTool("singleSelect")}>
            Single Select Tool
          </button>
          <button onClick={toggleGrid}>
            {gridVisible ? "Hide Grid" : "Show Grid"}
          </button>
          <button onClick={deleteSelectedSeats}>Delete</button>
          {/* <button onClick={handleAddSeat}>Add Seat</button> */}
          {/* <button onClick={handleAddSeat}>Add Seat</button> */}
          <button onClick={handleToggleLabelDirection}>
            Toggle Label Direction
          </button>
          {/* <button onClick={exportToJson}>Export As JSON</button> */}
          <button onClick={combineSeats}>Combine Seats</button>
        </div>
        {/* <div>
          <button onClick={handleIncreaseSeats}>Increase Seats</button>
          <button onClick={handleDecreaseSeats}>Decrease Seats</button>
          <span>Number of Seats: {seatCount}</span>
        </div> */}
        <div>
          <input
            type="number"
            value={startNumber}
            onChange={(e) => setStartNumber(parseInt(e.target.value))}
            placeholder="Enter starting number"
          />
          <button onClick={updateSeatLabels}>Set Starting Number</button>
        </div>
        <div>
          <p>Seat Spacing</p>
          <input
            type="number"
            value={spacingInput}
            onChange={handleSeatSpaceInputChange}
            min="0" // Minimum value the user can enter
            step="1" // Step increment for the input
          />
        </div>
        <div>
          <input
            type="number"
            value={seatCountInput}
            onChange={(e) => setSeatCountInput(e.target.value)}
            placeholder="Enter seat count"
          />
          <button onClick={handleAddSeat}>Add Seats</button>
          <button onClick={handleRemoveSeat}>Remove Seats</button>
        </div>
      </div>
      {activeGroup && (
        <GroupNameEditor
          groupId={activeGroup.id}
          updateGroupLabels={updateGroupLabels}
        />
      )}

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
          {groups.map((group) => {
            const groupSeats = seats.filter((seat) =>
              group.seatIds.includes(seat.id)
            );
            const firstSeat = groupSeats[0];
            const lastSeat = groupSeats[groupSeats.length - 1];

            return (
              <Group
                key={group.id}
                id={`group-${group.id}`}
                draggable
                onClick={() => handleGroupOnClick(group)}
              >
                {groupSeats.map((seat) => (
                  <Group
                    key={seat.id}
                    id={seat.id}
                    draggable={false}
                    onClick={() => handleSeatOnClick(seat)}
                  >
                    <Image
                      key={seat.id}
                      id={seat.id}
                      x={seat.x}
                      y={seat.y}
                      width={seat.width}
                      height={seat.height}
                      image={seat.image}
                      draggable={false}
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

                {firstSeat &&
                  (labelDirection === "left" || labelDirection === "both") && (
                    <Text
                      id={`left-${group.id}`}
                      x={firstSeat.x - 15}
                      y={firstSeat.y + firstSeat.height / 3}
                      text={groupLabels[group.id]?.left}
                      fontSize={16}
                      fill="black"
                      draggable={false}
                    />
                  )}
                {lastSeat &&
                  (labelDirection === "right" || labelDirection === "both") && (
                    <Text
                      id={`right-${group.id}`}
                      x={lastSeat.x + lastSeat.width + 5}
                      y={lastSeat.y + lastSeat.height / 3}
                      text={groupLabels[group.id]?.right}
                      fontSize={16}
                      fill="black"
                      draggable={false}
                    />
                  )}
              </Group>
            );
          })}

          {/* Render temporary seats */}
          {seats
            .filter((seat) => seat.isTemporary)
            .map((seat) => (
              <Group key={seat.id} id={seat.id} opacity={0.5}>
                <Image
                  key={seat.id}
                  id={seat.id}
                  x={seat.x}
                  y={seat.y}
                  width={seat.width}
                  height={seat.height}
                  image={seat.image}
                />
                <Text
                  x={seat.x + seat.width / 2}
                  y={seat.y + seat.height / 2}
                  text={seat.label}
                  fontSize={16}
                  fill="black"
                  offsetX={seat.width / 4} // Center the text
                  offsetY={8} // Adjust vertical centering
                />
              </Group>
            ))}

          {/* Render selection rectangle */}
          {activeTool === "select" && selectionRect && (
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

          {/* Transformer for selected elements */}
          <Transformer ref={transformerRef} />
        </Layer>

        {/* Grid Layer */}
        <Layer>
          {gridVisible &&
            createGrid(window.innerWidth, window.innerHeight - 100)}
        </Layer>
      </Stage>
    </div>
  );
};

export default SeatPlan;
