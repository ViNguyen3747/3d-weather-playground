import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";

const FOG = {
  transparent: true,
  opacity: 0.2,
  depthTest: false,
  depthFunc: false,
};
const BUILDINGS_COLORS = [
  "#abc4ff",
  "#fdeab1",
  "#f5efff",
  "#ccdbfd",
  "#afb795",
  "#fab995",
  "#d7e3fc",
  "#d2a89e",
];
const RainParticle = ({ position, isRainy, isStorm }) => {
  const ref = useRef();

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    ref.current.position.y = isRainy
      ? -((elapsedTime + position[1]) % 1.8)
      : isStorm
      ? -((elapsedTime * 3 + position[1]) % 1.9)
      : -((elapsedTime / 2 + position[1]) % 2.115);
  });
  return (
    <mesh
      ref={ref}
      position={position}
      scale={
        isRainy
          ? [0.5, Math.random() * 5, 0.5]
          : isStorm
          ? [0.5, Math.random() * 20, 0.5]
          : [1, 1, 1]
      }
    >
      <sphereBufferGeometry args={[0.01, 16, 16]} />
      <animated.meshBasicMaterial
        // color={isRainy || isStorm ? "#caf0f8" : "#ffffff"}
        color={"#ffffff"}
        toneMapped={false}
      />
    </mesh>
  );
};

export default ({ isNight, condition }) => {
  const { nodes } = useGLTF("./models.glb");
  const sunRayRef = useRef();
  const thunderFlash = useRef();

  useFrame(({ clock }) => {
    sunRayRef.current.rotation.z = -clock.getElapsedTime() / 4;

    if (Math.random() > 0.8 || thunderFlash.current.power > 8) {
      if (thunderFlash.current.power < 1)
        thunderFlash.current.position.set(
          Math.random() * 2 - 1,
          Math.random() - 0.1,
          Math.random() * 1.5 - 1
        );
      thunderFlash.current.power = Math.random() * 10;
    }
  });
  const sunMoon = useSpring({
    to: {
      sunPosition:
        ["clear", "cloudy"].includes(condition) && !isNight
          ? [0.5, 0, -0.7]
          : [0.5, 2.5, -0.7],
      moonPosition:
        ["clear", "cloudy"].includes(condition) && isNight
          ? [0.5, 0, -0.7]
          : [0.5, 2.5, -0.7],
    },
    config: { mass: 1, tension: 280, friction: 70 },
  });
  const mist = useSpring({
    to: { position: condition === "mist" ? [0, -2.5, 0] : [0, 3, 0] },
    config: { mass: 1, tension: 280, friction: 60 },
  });
  const clouds1 = useSpring({
    to: {
      position1: ["cloudy", "rainy", "snowy", "storm"].includes(condition)
        ? [0, -2.5, -4]
        : [0, 15, -4],

      position3: ["cloudy", "rainy", "snowy", "storm"].includes(condition)
        ? [4, -1.5, 1]
        : [4, 14, 1],

      position5: ["cloudy", "rainy", "snowy", "storm"].includes(condition)
        ? [-6, -2, 7]
        : [-6, 18, 7],
      position7: ["rainy", "snowy", "storm"].includes(condition)
        ? [0, 0, 0]
        : [0, 15, 0],
      position9: ["rainy", "snowy", "storm"].includes(condition)
        ? [3, -2, 4]
        : [3, 17, 4],
    },
    config: { mass: 1, tension: 280, friction: 60 },
  });
  const clouds2 = useSpring({
    to: {
      position2: ["cloudy", "rainy", "snowy", "storm"].includes(condition)
        ? [-7, -1, -5]
        : [-7, 15, -5],

      position4: ["cloudy", "rainy", "snowy", "storm"].includes(condition)
        ? [-5, -1, 2]
        : [-5, 17, 2],

      position6: ["cloudy", "rainy", "snowy", "storm"].includes(condition)
        ? [3, -3, 6]
        : [3, 19, 6],
      position8: ["rainy", "snowy", "storm"].includes(condition)
        ? [-7, -2, 5]
        : [-7, 17, 5],
      position10: ["rainy", "snowy", "storm"].includes(condition)
        ? [-4, -3, -3]
        : [-4, 15, -3],
    },
    config: { mass: 1, tension: 280, friction: 80 },
  });
  const rainy = useSpring({
    to: {
      thunderscale1: condition === "storm" ? 0.5 : 0,
      thunderscale2: condition === "storm" ? 1 : 0,
    },
    config: { mass: 1, tension: 300, friction: 60 },
  });
  const snow = useSpring({
    to: {
      opacity: ["rainy", "snowy"].includes(condition) ? 1 : 0,
      roofPosition: condition === "snowy" ? [0, 0, 0] : [0, 1, 0],
      roofOpacity: condition === "snowy" ? 1 : 0,
    },
    config: { mass: 1, tension: 280, friction: 60 },
  });

  const particles = new Array(condition === "storm" ? 200 : 100)
    .fill()
    .map(() => ({
      position: [
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2,
      ],
    }));

  return (
    <>
      <mesh geometry={nodes.base1.geometry}>
        <meshStandardMaterial color={"#abc4ff"} />
      </mesh>
      <mesh geometry={nodes.surface.geometry}>
        {condition === "snowy" ? (
          <meshBasicMaterial color={"#ffffff"} toneMapped={false} />
        ) : (
          <meshStandardMaterial color={"#c1d3fe"} />
        )}
      </mesh>
      <group scale={0.1}>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} geometry={nodes[`building${i + 1}`].geometry}>
            <meshStandardMaterial color={BUILDINGS_COLORS[i]} />
          </mesh>
        ))}
        <mesh geometry={nodes.door_light.geometry}>
          <meshBasicMaterial color={"#fef9ef"} toneMapped={false} />
        </mesh>
        <mesh geometry={nodes.door_dark.geometry}>
          <meshBasicMaterial
            color={isNight ? "#495057" : "#fef9ef"}
            toneMapped={false}
          />
        </mesh>
        <animated.mesh
          geometry={nodes.snow_roof.geometry}
          position={snow.roofPosition}
        >
          <animated.meshBasicMaterial
            color={"#ffffff"}
            toneMapped={false}
            transparent
            opacity={snow.roofOpacity}
          />
        </animated.mesh>
      </group>
      <group position={[0, 0, 0.1]}>
        <mesh geometry={nodes.streetlight1.geometry}>
          <meshStandardMaterial color={"#9aa2d5"} />
        </mesh>
        <mesh geometry={nodes.streetlight2.geometry} position={[0.5, 0, 0]}>
          <meshStandardMaterial color={"#9aa2d5"} />
        </mesh>
        <group visible={isNight}>
          <mesh geometry={nodes.light1.geometry}>
            <meshBasicMaterial
              color={"#fffceb"}
              transparent
              opacity={0.6}
              toneMapped={false}
            />
          </mesh>
          <mesh geometry={nodes.light2.geometry} position={[0.5, 0, 0]}>
            <meshBasicMaterial
              color={"#fffceb"}
              transparent
              opacity={0.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>
      {/* Weather */}
      <group position={[0, 3, 0]}>
        <animated.group position={sunMoon.sunPosition}>
          {/* sun */}
          <mesh geometry={nodes.sun.geometry} scale={0.3}>
            <meshToonMaterial color={"#fb8500"} />
          </mesh>
          <mesh geometry={nodes.sun_ray.geometry} scale={0.1} ref={sunRayRef}>
            <meshToonMaterial color={"#e76f51"} />
          </mesh>
        </animated.group>
        <animated.mesh
          geometry={nodes.moon.geometry}
          scale={0.3}
          position={sunMoon.moonPosition}
        >
          <meshBasicMaterial color={"#ffffff"} toneMapped={false} />
        </animated.mesh>
        {/* cloud */}
        <group scale={0.15}>
          <animated.mesh
            geometry={nodes.cloud1.geometry}
            position={clouds1.position1}
            scale={[1.5, 1, 1.5]}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud2.geometry}
            position={clouds2.position2}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud3.geometry}
            position={clouds1.position3}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud4.geometry}
            position={clouds2.position4}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud5.geometry}
            position={clouds1.position5}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud6.geometry}
            position={clouds2.position6}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          {/* snowy or rainy */}
          <animated.mesh
            geometry={nodes.cloud7.geometry}
            position={clouds1.position7}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud8.geometry}
            position={clouds2.position8}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud9.geometry}
            position={clouds1.position9}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud10.geometry}
            position={clouds2.position10}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          {/* thunders */}
          <group>
            <animated.mesh
              geometry={nodes.thunder1.geometry}
              scale={rainy.thunderscale1}
              position={[4, -3, 7]}
              castShadow={false}
            >
              <meshBasicMaterial color={"#fff2b2"} toneMapped={false} />
            </animated.mesh>
            <animated.mesh
              geometry={nodes.thunder2.geometry}
              scale={rainy.thunderscale2}
              position={[-5, -3, 2]}
              castShadow={false}
            >
              <meshBasicMaterial color={"#fff2b2"} toneMapped={false} />
            </animated.mesh>
          </group>
        </group>
        {/* fog */}
        <animated.group scale={[0.15, 0.15, 0.15]} position={mist.position}>
          <mesh geometry={nodes.cloud11.geometry} position={[0, -2, -1]}>
            <meshToonMaterial color={"#ffffff"} {...FOG} />
          </mesh>
          <mesh geometry={nodes.cloud7.geometry} position={[-3, 0, -3]}>
            <meshToonMaterial color={"#ffffff"} {...FOG} />
          </mesh>
          <mesh geometry={nodes.cloud6.geometry} position={[-3, 0, 1]}>
            <meshToonMaterial color={"#ffffff"} {...FOG} />
          </mesh>
          <mesh geometry={nodes.cloud9.geometry} position={[-0, 0, 4]}>
            <meshToonMaterial color={"#ffffff"} {...FOG} />
          </mesh>
          <mesh geometry={nodes.cloud1.geometry} position={[3, 0, 4]}>
            <meshToonMaterial color={"#ffffff"} {...FOG} />
          </mesh>
        </animated.group>
        <>
          <group
            position={[0, -1, 0]}
            visible={["rainy", "snowy", "storm"].includes(condition)}
          >
            {particles.map((particle, index) => (
              <RainParticle
                key={index}
                position={particle.position}
                snowOpacity={snow.opacity}
                isRainy={condition === "rainy"}
                isStorm={condition === "storm"}
              />
            ))}
          </group>
        </>
      </group>
      <spotLight
        color="#C5EFFD"
        position={[0, 0.5, 0]}
        ref={thunderFlash}
        visible={condition === "storm"}
        distance={2.5}
        decay={1}
        angle={Math.PI}
      />
    </>
  );
};
