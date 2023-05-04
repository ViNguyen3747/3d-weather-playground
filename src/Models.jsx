import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
const FOG = {
  transparent: true,
  opacity: 0.5,
  depthWrite: false,
};

const Fog = ({ nodes }) => {
  return (
    <>
      <mesh geometry={nodes.cloud1.geometry} position={[0, 0, -2]}>
        <meshToonMaterial color={"#ffffff"} {...FOG} />
      </mesh>
      <mesh geometry={nodes.cloud2.geometry} position={[-7, 0, -3]}>
        <meshToonMaterial color={"#ffffff"} {...FOG} />
      </mesh>
      <mesh geometry={nodes.cloud4.geometry} position={[-5, 0, 1]}>
        <meshToonMaterial color={"#ffffff"} {...FOG} />
      </mesh>
      <mesh geometry={nodes.cloud5.geometry} position={[-6, 0, 4]}>
        <meshToonMaterial color={"#ffffff"} {...FOG} />
      </mesh>
      <mesh geometry={nodes.cloud6.geometry} position={[3, 0, 4]}>
        <meshToonMaterial color={"#ffffff"} {...FOG} />
      </mesh>
    </>
  );
};
export default ({ isNight, condition }) => {
  const { nodes } = useGLTF("./models.glb");
  const sunRayRef = useRef();
  useFrame(({ clock }) => {
    sunRayRef.current.rotation.z = -clock.getElapsedTime() / 4;
  });
  const sunMoon = useSpring({
    to: {
      sunPosition:
        condition === "clear" && !isNight ? [0.5, 0, -0.7] : [0.5, 4, -0.7],
      moonPosition:
        condition === "clear" && isNight ? [0.5, 0, -0.7] : [0.5, 4, -0.7],
    },
    config: { mass: 1, tension: 280, friction: 70 },
  });
  const mist = useSpring({
    to: { position: condition === "mist" ? [0, -2.5, 0] : [0, -10, 0] },
    config: { mass: 1, tension: 280, friction: 60 },
  });
  const clouds = useSpring({
    to: {
      position1: condition === "cloudy" ? [0, -2.5, -4] : [0, 70, -4],
      position2: condition === "cloudy" ? [-7, -1, -5] : [-7, 50, -5],
      position3: condition === "cloudy" ? [4, -1.5, 1] : [4, 25, 1],
      position4: condition === "cloudy" ? [-5, -1, 2] : [-5, 70, 2],
      position5: condition === "cloudy" ? [-6, -2, 7] : [-6, 50, 7],
      position6: condition === "cloudy" ? [3, -3, 6] : [3, 40, 6],
    },
    config: { mass: 1, tension: 280, friction: 60 },
  });
  console.log(nodes);
  return (
    <group position={[-0.5, -2, -0.5]}>
      <mesh geometry={nodes.base1.geometry}>
        <meshStandardMaterial color={"#d7e3fc"} />
      </mesh>
      <mesh geometry={nodes.base2.geometry}>
        <meshStandardMaterial color={"#d7e3fc"} />
      </mesh>
      <group scale={0.1}>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} geometry={nodes[`building${i + 1}`].geometry}>
            <meshStandardMaterial color={"#abc4ff"} />
          </mesh>
        ))}
        <mesh geometry={nodes.door_light.geometry}>
          <meshBasicMaterial color={"#fffceb"} toneMapped={false} />
        </mesh>
        <mesh geometry={nodes.door_dark.geometry}>
          <meshBasicMaterial
            color={isNight ? "#001d3d" : "#fffceb"}
            toneMapped={false}
          />
        </mesh>
      </group>
      <group position={[0, 0, 0.1]}>
        <mesh geometry={nodes.streetlight1.geometry}>
          <meshStandardMaterial color={"#abc4ff"} />
        </mesh>
        <mesh geometry={nodes.streetlight2.geometry} position={[0.5, 0, 0]}>
          <meshStandardMaterial color={"#abc4ff"} />
        </mesh>
        {isNight && (
          <>
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
          </>
        )}
      </group>

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
            position={clouds.position1}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud2.geometry}
            position={clouds.position2}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud3.geometry}
            position={clouds.position3}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud4.geometry}
            position={clouds.position4}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud5.geometry}
            position={clouds.position5}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
          <animated.mesh
            geometry={nodes.cloud6.geometry}
            position={clouds.position6}
          >
            <meshToonMaterial color={"#ffffff"} />
          </animated.mesh>
        </group>
        {/* fog */}
        <animated.group scale={[0.15, 0.2, 0.2]} position={mist.position}>
          <Fog nodes={nodes} />
        </animated.group>
      </group>
    </group>
  );
};
