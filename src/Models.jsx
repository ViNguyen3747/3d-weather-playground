import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
const FOG = {
  transparent: true,
  opacity: 0.5,
  depthWrite: false,
};

const RainParticle = ({ position, snowOpacity }) => {
  const ref = useRef();

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    ref.current.position.y = -((elapsedTime / 2 + position[1]) % 2.115);
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereBufferGeometry args={[0.01, 16, 16]} />
      <animated.meshBasicMaterial
        color={"#ffffff"}
        transparent
        opacity={snowOpacity}
        toneMapped={false}
      />
    </mesh>
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
        (condition === "clear" || condition === "cloudy") && !isNight
          ? [0.5, 0, -0.7]
          : [0.5, 2.5, -0.7],
      moonPosition:
        (condition === "clear" || condition === "cloudy") && isNight
          ? [0.5, 0, -0.7]
          : [0.5, 2.5, -0.7],
    },
    config: { mass: 1, tension: 280, friction: 70 },
  });
  const mist = useSpring({
    to: { position: condition === "mist" ? [0, -2.5, 0] : [0, -10, 0] },
    config: { mass: 1, tension: 280, friction: 60 },
  });
  const clouds1 = useSpring({
    to: {
      position1:
        condition === "cloudy" || condition === "snowy"
          ? [0, -2.5, -4]
          : [0, 11, -4],

      position3:
        condition === "cloudy" || condition === "snowy"
          ? [4, -1.5, 1]
          : [4, 14, 1],

      position5:
        condition === "cloudy" || condition === "snowy"
          ? [-6, -2, 7]
          : [-6, 18, 7],
    },
    config: { mass: 1, tension: 280, friction: 60 },
  });
  const clouds2 = useSpring({
    to: {
      position2:
        condition === "cloudy" || condition === "snowy"
          ? [-7, -1, -5]
          : [-7, 15, -5],

      position4:
        condition === "cloudy" || condition === "snowy"
          ? [-5, -1, 2]
          : [-5, 16, 2],

      position6:
        condition === "cloudy" || condition === "snowy"
          ? [3, -3, 6]
          : [3, 14, 6],
    },
    config: { mass: 1, tension: 280, friction: 80 },
  });

  const snow = useSpring({
    to: { opacity: condition === "snowy" ? 1 : 0 },
    config: { mass: 1, tension: 280, friction: 60 },
  });

  const particles = new Array(100).fill().map(() => ({
    position: [
      (Math.random() - 0.5) * 2,
      Math.random() * 2,
      (Math.random() - 0.5) * 2,
    ],
  }));
  return (
    <>
      <mesh geometry={nodes.base1.geometry}>
        <meshStandardMaterial color={"#d7e3fc"} />
      </mesh>
      <mesh geometry={nodes.surface.geometry}>
        {condition === "snowy" ? (
          <meshBasicMaterial color={"#ffffff"} toneMapped={false} />
        ) : (
          <meshStandardMaterial color={"#d7e3fc"} />
        )}
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
        {condition === "snowy" && (
          <mesh geometry={nodes.snow_roof.geometry}>
            <meshBasicMaterial color={"#ffffff"} toneMapped={false} />
          </mesh>
        )}
      </group>
      <group position={[0, 0, 0.1]}>
        <mesh geometry={nodes.streetlight1.geometry}>
          <meshStandardMaterial color={"#8d99ae"} />
        </mesh>
        <mesh geometry={nodes.streetlight2.geometry} position={[0.5, 0, 0]}>
          <meshStandardMaterial color={"#8d99ae"} />
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
        </group>
        {/* fog */}
        <animated.group scale={[0.15, 0.2, 0.2]} position={mist.position}>
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
        </animated.group>
        <>
          <group position={[0, -1, 0]}>
            {particles.map((particle, index) => (
              <RainParticle
                key={index}
                position={particle.position}
                snowOpacity={snow.opacity}
              />
            ))}
          </group>
        </>
      </group>
    </>
  );
};
