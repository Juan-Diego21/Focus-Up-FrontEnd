--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (aa1f746)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_session_jwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_session_jwt WITH SCHEMA public;


--
-- Name: EXTENSION pg_session_jwt; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_session_jwt IS 'pg_session_jwt: manage authentication sessions using JWTs';


--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA neon_auth;


ALTER SCHEMA neon_auth OWNER TO neondb_owner;

--
-- Name: actualizar_fecha_actualizacion(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.actualizar_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_fecha_actualizacion() OWNER TO neondb_owner;

--
-- Name: actualizar_fecha_actualizacion_metodos_realizados(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.actualizar_fecha_actualizacion_metodos_realizados() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_fecha_actualizacion_metodos_realizados() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users_sync; Type: TABLE; Schema: neon_auth; Owner: neondb_owner
--

CREATE TABLE neon_auth.users_sync (
    raw_json jsonb NOT NULL,
    id text GENERATED ALWAYS AS ((raw_json ->> 'id'::text)) STORED NOT NULL,
    name text GENERATED ALWAYS AS ((raw_json ->> 'display_name'::text)) STORED,
    email text GENERATED ALWAYS AS ((raw_json ->> 'primary_email'::text)) STORED,
    created_at timestamp with time zone GENERATED ALWAYS AS (to_timestamp((trunc((((raw_json ->> 'signed_up_at_millis'::text))::bigint)::double precision) / (1000)::double precision))) STORED,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE neon_auth.users_sync OWNER TO neondb_owner;

--
-- Name: albummusica; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.albummusica (
    id_album integer NOT NULL,
    nombre_album character varying(45) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    descripcion text,
    genero character varying(50)
);


ALTER TABLE public.albummusica OWNER TO neondb_owner;

--
-- Name: albummusica_id_album_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.albummusica_id_album_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.albummusica_id_album_seq OWNER TO neondb_owner;

--
-- Name: albummusica_id_album_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.albummusica_id_album_seq OWNED BY public.albummusica.id_album;


--
-- Name: alertas; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.alertas (
    id_alerta integer NOT NULL,
    tipo_alerta character varying(45),
    mensaje_alerta character varying(100) NOT NULL,
    fecha_alerta date NOT NULL,
    hora_alerta time without time zone NOT NULL,
    id_sesion integer,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT alertas_tipo_alerta_check CHECK (((tipo_alerta)::text = ANY ((ARRAY['Notificación'::character varying, 'Recordatorio'::character varying, 'Advertencia'::character varying])::text[])))
);


ALTER TABLE public.alertas OWNER TO neondb_owner;

--
-- Name: alertas_id_alerta_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.alertas_id_alerta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alertas_id_alerta_seq OWNER TO neondb_owner;

--
-- Name: alertas_id_alerta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.alertas_id_alerta_seq OWNED BY public.alertas.id_alerta;


--
-- Name: aplicacionesrestringidas; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.aplicacionesrestringidas (
    id_aplicacion integer NOT NULL,
    nombre_aplicacion character varying(45) NOT NULL,
    hora_restriccion time without time zone NOT NULL,
    fecha_restriccion date NOT NULL,
    id_usuario integer,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.aplicacionesrestringidas OWNER TO neondb_owner;

--
-- Name: aplicacionesrestringidas_id_aplicacion_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.aplicacionesrestringidas_id_aplicacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aplicacionesrestringidas_id_aplicacion_seq OWNER TO neondb_owner;

--
-- Name: aplicacionesrestringidas_id_aplicacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.aplicacionesrestringidas_id_aplicacion_seq OWNED BY public.aplicacionesrestringidas.id_aplicacion;


--
-- Name: beneficios; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.beneficios (
    id_beneficio integer NOT NULL,
    descripcion_beneficio character varying(100) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.beneficios OWNER TO neondb_owner;

--
-- Name: beneficios_id_beneficio_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.beneficios_id_beneficio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.beneficios_id_beneficio_seq OWNER TO neondb_owner;

--
-- Name: beneficios_id_beneficio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.beneficios_id_beneficio_seq OWNED BY public.beneficios.id_beneficio;


--
-- Name: bibliotecametodosestudio; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bibliotecametodosestudio (
    id_metodo integer NOT NULL,
    nombre_metodo character varying(45) NOT NULL,
    descripcion text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bibliotecametodosestudio OWNER TO neondb_owner;

--
-- Name: bibliotecametodosestudio_id_metodo_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bibliotecametodosestudio_id_metodo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bibliotecametodosestudio_id_metodo_seq OWNER TO neondb_owner;

--
-- Name: bibliotecametodosestudio_id_metodo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bibliotecametodosestudio_id_metodo_seq OWNED BY public.bibliotecametodosestudio.id_metodo;


--
-- Name: configuracion_sistema; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.configuracion_sistema (
    id_config integer NOT NULL,
    url_frontend character varying(200) NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.configuracion_sistema OWNER TO neondb_owner;

--
-- Name: configuracion_sistema_id_config_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.configuracion_sistema_id_config_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configuracion_sistema_id_config_seq OWNER TO neondb_owner;

--
-- Name: configuracion_sistema_id_config_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.configuracion_sistema_id_config_seq OWNED BY public.configuracion_sistema.id_config;


--
-- Name: distracciones; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.distracciones (
    id_distraccion integer NOT NULL,
    nombre_distraccion character varying(50) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.distracciones OWNER TO neondb_owner;

--
-- Name: distracciones_id_distraccion_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.distracciones_id_distraccion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.distracciones_id_distraccion_seq OWNER TO neondb_owner;

--
-- Name: distracciones_id_distraccion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.distracciones_id_distraccion_seq OWNED BY public.distracciones.id_distraccion;


--
-- Name: eventos; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.eventos (
    id_evento integer NOT NULL,
    nombre_evento character varying(100) NOT NULL,
    fecha_evento date NOT NULL,
    hora_evento time without time zone NOT NULL,
    descripcion_evento text,
    id_usuario integer,
    id_metodo integer,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_album integer,
    estado character varying(20) DEFAULT NULL::character varying
);


ALTER TABLE public.eventos OWNER TO neondb_owner;

--
-- Name: eventos_id_evento_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.eventos_id_evento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.eventos_id_evento_seq OWNER TO neondb_owner;

--
-- Name: eventos_id_evento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.eventos_id_evento_seq OWNED BY public.eventos.id_evento;


--
-- Name: intereses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.intereses (
    id_interes integer NOT NULL,
    nombre_interes character varying(50) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.intereses OWNER TO neondb_owner;

--
-- Name: intereses_id_interes_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.intereses_id_interes_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.intereses_id_interes_seq OWNER TO neondb_owner;

--
-- Name: intereses_id_interes_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.intereses_id_interes_seq OWNED BY public.intereses.id_interes;


--
-- Name: metodobeneficios; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.metodobeneficios (
    id_beneficio integer NOT NULL,
    id_metodo integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.metodobeneficios OWNER TO neondb_owner;

--
-- Name: metodos_realizados; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.metodos_realizados (
    id_metodo_realizado integer NOT NULL,
    id_metodo integer NOT NULL,
    id_usuario integer NOT NULL,
    progreso integer DEFAULT 0,
    estado character varying(20) DEFAULT 'in_progress'::character varying,
    fecha_inicio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_fin timestamp without time zone,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.metodos_realizados OWNER TO neondb_owner;

--
-- Name: metodos_realizados_id_metodo_realizado_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.metodos_realizados_id_metodo_realizado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.metodos_realizados_id_metodo_realizado_seq OWNER TO neondb_owner;

--
-- Name: metodos_realizados_id_metodo_realizado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.metodos_realizados_id_metodo_realizado_seq OWNED BY public.metodos_realizados.id_metodo_realizado;


--
-- Name: musica; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.musica (
    id_cancion integer NOT NULL,
    nombre_cancion character varying(45) NOT NULL,
    artista_cancion character varying(45),
    genero_cancion character varying(45),
    categoria_musica character varying(30),
    id_album integer,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    url_musica text NOT NULL,
    CONSTRAINT musica_categoria_musica_check CHECK (((categoria_musica)::text = ANY ((ARRAY['Clásica'::character varying, 'Instrumental'::character varying, 'LoFi'::character varying, 'Naturaleza'::character varying, 'Otro'::character varying])::text[])))
);


ALTER TABLE public.musica OWNER TO neondb_owner;

--
-- Name: musica_id_cancion_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.musica_id_cancion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.musica_id_cancion_seq OWNER TO neondb_owner;

--
-- Name: musica_id_cancion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.musica_id_cancion_seq OWNED BY public.musica.id_cancion;


--
-- Name: notificaciones_programadas; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notificaciones_programadas (
    id_notificacion integer NOT NULL,
    id_usuario integer,
    tipo character varying(50) NOT NULL,
    titulo character varying(255),
    mensaje text,
    fecha_programada timestamp without time zone NOT NULL,
    enviada boolean DEFAULT false,
    fecha_envio timestamp without time zone
);


ALTER TABLE public.notificaciones_programadas OWNER TO neondb_owner;

--
-- Name: notificaciones_programadas_id_notificacion_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.notificaciones_programadas_id_notificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificaciones_programadas_id_notificacion_seq OWNER TO neondb_owner;

--
-- Name: notificaciones_programadas_id_notificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.notificaciones_programadas_id_notificacion_seq OWNED BY public.notificaciones_programadas.id_notificacion;


--
-- Name: notificaciones_usuario; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notificaciones_usuario (
    id_usuario integer NOT NULL,
    eventos boolean DEFAULT true,
    metodos_pendientes boolean DEFAULT true,
    sesiones_pendientes boolean DEFAULT true,
    motivacion boolean DEFAULT true,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notificaciones_usuario OWNER TO neondb_owner;

--
-- Name: objetivoestudio; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.objetivoestudio (
    id_objetivo_estudio integer NOT NULL,
    nombre_objetivo character varying(50) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.objetivoestudio OWNER TO neondb_owner;

--
-- Name: objetivoestudio_id_objetivo_estudio_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.objetivoestudio_id_objetivo_estudio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.objetivoestudio_id_objetivo_estudio_seq OWNER TO neondb_owner;

--
-- Name: objetivoestudio_id_objetivo_estudio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.objetivoestudio_id_objetivo_estudio_seq OWNED BY public.objetivoestudio.id_objetivo_estudio;


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.password_resets (
    id integer NOT NULL,
    user_id integer,
    code character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_resets OWNER TO neondb_owner;

--
-- Name: password_resets_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.password_resets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_resets_id_seq OWNER TO neondb_owner;

--
-- Name: password_resets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.password_resets_id_seq OWNED BY public.password_resets.id;


--
-- Name: sesiones_concentracion; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sesiones_concentracion (
    id_sesion integer NOT NULL,
    id_usuario integer NOT NULL,
    titulo character varying(150),
    descripcion text,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    tipo character varying(20) NOT NULL,
    id_evento integer,
    id_metodo integer,
    id_album integer,
    tiempo_transcurrido interval DEFAULT '00:00:00'::interval,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ultima_interaccion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sesiones_concentracion OWNER TO neondb_owner;

--
-- Name: sesiones_concentracion_id_sesion_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sesiones_concentracion_id_sesion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sesiones_concentracion_id_sesion_seq OWNER TO neondb_owner;

--
-- Name: sesiones_concentracion_id_sesion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sesiones_concentracion_id_sesion_seq OWNED BY public.sesiones_concentracion.id_sesion;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    nombre_usuario character varying(50) NOT NULL,
    pais character varying(50),
    genero character varying(20),
    fecha_nacimiento date NOT NULL,
    horario_fav time without time zone,
    correo character varying(100) NOT NULL,
    contrasena character varying(255) NOT NULL,
    id_objetivo_estudio integer,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    token_version integer DEFAULT 1,
    CONSTRAINT usuario_fecha_nacimiento_check CHECK ((fecha_nacimiento <= (CURRENT_DATE - '13 years'::interval))),
    CONSTRAINT usuario_genero_check CHECK (((genero)::text = ANY ((ARRAY['Masculino'::character varying, 'Femenino'::character varying, 'Otro'::character varying, 'Prefiero no decir'::character varying])::text[])))
);


ALTER TABLE public.usuario OWNER TO neondb_owner;

--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO neondb_owner;

--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- Name: usuariodistracciones; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.usuariodistracciones (
    id_usuario integer NOT NULL,
    id_distraccion integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuariodistracciones OWNER TO neondb_owner;

--
-- Name: usuariointereses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.usuariointereses (
    id_usuario integer NOT NULL,
    id_interes integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuariointereses OWNER TO neondb_owner;

--
-- Name: albummusica id_album; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.albummusica ALTER COLUMN id_album SET DEFAULT nextval('public.albummusica_id_album_seq'::regclass);


--
-- Name: alertas id_alerta; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.alertas ALTER COLUMN id_alerta SET DEFAULT nextval('public.alertas_id_alerta_seq'::regclass);


--
-- Name: aplicacionesrestringidas id_aplicacion; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.aplicacionesrestringidas ALTER COLUMN id_aplicacion SET DEFAULT nextval('public.aplicacionesrestringidas_id_aplicacion_seq'::regclass);


--
-- Name: beneficios id_beneficio; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.beneficios ALTER COLUMN id_beneficio SET DEFAULT nextval('public.beneficios_id_beneficio_seq'::regclass);


--
-- Name: bibliotecametodosestudio id_metodo; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bibliotecametodosestudio ALTER COLUMN id_metodo SET DEFAULT nextval('public.bibliotecametodosestudio_id_metodo_seq'::regclass);


--
-- Name: configuracion_sistema id_config; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.configuracion_sistema ALTER COLUMN id_config SET DEFAULT nextval('public.configuracion_sistema_id_config_seq'::regclass);


--
-- Name: distracciones id_distraccion; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.distracciones ALTER COLUMN id_distraccion SET DEFAULT nextval('public.distracciones_id_distraccion_seq'::regclass);


--
-- Name: eventos id_evento; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.eventos ALTER COLUMN id_evento SET DEFAULT nextval('public.eventos_id_evento_seq'::regclass);


--
-- Name: intereses id_interes; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.intereses ALTER COLUMN id_interes SET DEFAULT nextval('public.intereses_id_interes_seq'::regclass);


--
-- Name: metodos_realizados id_metodo_realizado; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.metodos_realizados ALTER COLUMN id_metodo_realizado SET DEFAULT nextval('public.metodos_realizados_id_metodo_realizado_seq'::regclass);


--
-- Name: musica id_cancion; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.musica ALTER COLUMN id_cancion SET DEFAULT nextval('public.musica_id_cancion_seq'::regclass);


--
-- Name: notificaciones_programadas id_notificacion; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notificaciones_programadas ALTER COLUMN id_notificacion SET DEFAULT nextval('public.notificaciones_programadas_id_notificacion_seq'::regclass);


--
-- Name: objetivoestudio id_objetivo_estudio; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.objetivoestudio ALTER COLUMN id_objetivo_estudio SET DEFAULT nextval('public.objetivoestudio_id_objetivo_estudio_seq'::regclass);


--
-- Name: password_resets id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.password_resets ALTER COLUMN id SET DEFAULT nextval('public.password_resets_id_seq'::regclass);


--
-- Name: sesiones_concentracion id_sesion; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sesiones_concentracion ALTER COLUMN id_sesion SET DEFAULT nextval('public.sesiones_concentracion_id_sesion_seq'::regclass);


--
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- Data for Name: users_sync; Type: TABLE DATA; Schema: neon_auth; Owner: neondb_owner
--

COPY neon_auth.users_sync (raw_json, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: albummusica; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.albummusica (id_album, nombre_album, fecha_creacion, fecha_actualizacion, descripcion, genero) FROM stdin;
3	Relajantes	2025-10-01 01:11:30.589385	2025-10-01 01:11:30.589385	Sonidos ambientales para calma mental y reducir estrés	Relajante
2	Naturaleza	2025-10-01 01:11:16.846336	2025-10-01 01:11:16.846336	Paisajes sonoros naturales para enfoque y tranquilidad	Naturaleza
1	Lofi	2025-10-01 01:11:01.999933	2025-10-01 01:11:01.999933	Beats relajantes para estudio y concentración profunda	Lofi
\.


--
-- Data for Name: alertas; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.alertas (id_alerta, tipo_alerta, mensaje_alerta, fecha_alerta, hora_alerta, id_sesion, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: aplicacionesrestringidas; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.aplicacionesrestringidas (id_aplicacion, nombre_aplicacion, hora_restriccion, fecha_restriccion, id_usuario, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: beneficios; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.beneficios (id_beneficio, descripcion_beneficio, fecha_creacion, fecha_actualizacion) FROM stdin;
1	Aumenta la concentración	2025-10-01 05:08:38.483984	2025-10-01 05:08:38.483984
3	Facilita el aprendizaje significativo\n	2025-10-01 05:09:20.59696	2025-10-01 05:09:20.59696
4	Ayuda a visualizar conceptos\n	2025-10-01 05:09:39.538197	2025-10-01 05:09:39.538197
5	Fomenta la creatividad\n	2025-10-01 05:10:03.69644	2025-10-01 05:10:03.69644
7	Mejora la retención a largo plazo	2025-10-01 05:10:23.705825	2025-10-01 05:10:23.705825
8	Evita el olvido rápido\n	2025-10-01 05:10:43.275378	2025-10-01 05:10:43.275378
13	Identifica lagunas en la comprensión	2025-10-01 05:12:40.051758	2025-10-01 05:12:40.051758
18	Aumenta la claridad al estudiar	2025-10-01 05:12:40.057096	2025-10-01 05:12:40.057096
10	Profundiza la comprensión\n	2025-10-01 05:12:40.055519	2025-10-01 05:12:40.055519
17	Facilita el repaso\n	2025-10-01 05:12:40.058978	2025-10-01 05:12:40.058978
14	Refuerza el aprendizaje\n	2025-10-01 05:12:40.058	2025-10-01 05:12:40.058
11	Fortalece la memoria\n	2025-10-01 05:12:40.065884	2025-10-01 05:12:40.065884
12	Desarrolla habilidades prácticas\n	2025-10-01 05:12:40.065468	2025-10-01 05:12:40.065468
15	Mejora la comunicación\n	2025-10-01 05:12:40.064928	2025-10-01 05:12:40.064928
9	Optimiza el tiempo de estudio\n	2025-10-01 05:12:40.074131	2025-10-01 05:12:40.074131
16	Mejora la organización\n	2025-10-01 05:12:40.076543	2025-10-01 05:12:40.076543
2	Reduce la fatiga mental	2025-10-01 05:09:02.286042	2025-10-29 20:58:15.504983
\.


--
-- Data for Name: bibliotecametodosestudio; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bibliotecametodosestudio (id_metodo, nombre_metodo, descripcion, fecha_creacion, fecha_actualizacion) FROM stdin;
1	Método Pomodoro	Técnica de gestion de tiempo. Divide el tiempo de estudio en intervalos de trabajo y descanso	2025-10-01 05:15:34.455541	2025-10-01 05:15:34.455541
5	Método Feynman	Aprender explicando. Intenta explicar el tema como si se lo enseñaras a alguien más.	2025-10-01 05:19:48.882205	2025-10-01 05:19:48.882205
2	Mapas Mentales	Organiza visualmente las ideas. Crea mapas mentales para conectar ideas clave.	2025-10-01 05:17:09.054313	2025-10-01 05:17:09.054313
4	Práctica Activa	Aprende haciendo. Pon a prueba tu conocimiento respondiendo preguntas o resolviendo problemas.	2025-10-01 05:18:43.031362	2025-10-01 05:18:43.031362
6	Método Cornell	Notas efectivas. Toma notas de manera estructurada. Facilita el repaso y la compresión.	2025-10-01 05:20:49.81267	2025-10-01 05:20:49.81267
3	Repaso Espaciado	Reforzamiento a largo plazo. Revisa la informacion en intervalos regulares.	2025-10-01 05:17:52.393242	2025-10-01 05:17:52.393242
\.


--
-- Data for Name: configuracion_sistema; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.configuracion_sistema (id_config, url_frontend, fecha_actualizacion) FROM stdin;
1	http://localhost:5173	2025-11-21 03:55:41.527637
\.


--
-- Data for Name: distracciones; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.distracciones (id_distraccion, nombre_distraccion, fecha_creacion, fecha_actualizacion) FROM stdin;
1	Redes sociales	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
2	Mensajería instantánea	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
3	Notificaciones del teléfono	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
4	Correo electrónico	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
5	Plataformas de video	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
6	Videojuegos	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
7	Scroll infinito	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
8	Compras online	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
9	Ruidos externos	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
10	Interrupciones de otras personas	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
11	Hambre o sed	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
12	Falta de comodidad	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
13	Desorden en el espacio	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
14	Mascotas	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
15	Pensamientos intrusivos	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
16	Sueño/fatiga	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
17	Aburrimiento	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
18	Multitarea	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
19	Día soñando despierto	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
20	Estrés o ansiedad	2025-09-11 20:38:40.905721	2025-09-11 20:38:40.905721
\.


--
-- Data for Name: eventos; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.eventos (id_evento, nombre_evento, fecha_evento, hora_evento, descripcion_evento, id_usuario, id_metodo, fecha_creacion, fecha_actualizacion, id_album, estado) FROM stdin;
33	Hola	2025-11-25	01:00:00	\N	51	\N	2025-11-21 20:59:10.799625	2025-11-21 21:10:23.953888	\N	\N
\.


--
-- Data for Name: intereses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.intereses (id_interes, nombre_interes, fecha_creacion, fecha_actualizacion) FROM stdin;
1	Mejorar memoria	2025-09-11 20:38:41.046856	2025-09-11 20:38:41.046856
2	Reducir distracciones	2025-09-11 20:38:41.046856	2025-09-11 20:38:41.046856
3	Organizar tiempo	2025-09-11 20:38:41.046856	2025-09-11 20:38:41.046856
4	Aumentar productividad	2025-09-11 20:38:41.046856	2025-09-11 20:38:41.046856
5	Incrementar creatividad	2025-09-11 20:38:41.046856	2025-09-11 20:38:41.046856
6	Mejorar comprensión lectora	2025-09-11 20:38:41.046856	2025-09-11 20:38:41.046856
7	Gestionar el estrés	2025-09-11 20:38:41.046856	2025-09-11 20:38:41.046856
8	Aprender nuevas habilidades	2025-09-11 20:38:41.046856	2025-09-11 20:38:41.046856
\.


--
-- Data for Name: metodobeneficios; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.metodobeneficios (id_beneficio, id_metodo, fecha_creacion) FROM stdin;
1	1	2025-10-01 07:10:24.40974
2	1	2025-10-01 07:10:24.40974
9	1	2025-10-01 07:10:24.40974
16	1	2025-10-01 07:10:24.40974
3	2	2025-10-01 07:10:24.40974
4	2	2025-10-01 07:10:24.40974
5	2	2025-10-01 07:10:24.40974
11	2	2025-10-01 07:10:24.40974
15	2	2025-10-01 07:10:24.40974
16	2	2025-10-01 07:10:24.40974
18	2	2025-10-01 07:10:24.40974
7	3	2025-10-01 07:10:24.40974
8	3	2025-10-01 07:10:24.40974
11	3	2025-10-01 07:10:24.40974
14	3	2025-10-01 07:10:24.40974
17	3	2025-10-01 07:10:24.40974
3	4	2025-10-01 07:10:24.40974
7	4	2025-10-01 07:10:24.40974
11	4	2025-10-01 07:10:24.40974
12	4	2025-10-01 07:10:24.40974
13	4	2025-10-01 07:10:24.40974
14	4	2025-10-01 07:10:24.40974
3	5	2025-10-01 07:10:24.40974
10	5	2025-10-01 07:10:24.40974
13	5	2025-10-01 07:10:24.40974
15	5	2025-10-01 07:10:24.40974
18	5	2025-10-01 07:10:24.40974
7	6	2025-10-01 07:10:24.40974
16	6	2025-10-01 07:10:24.40974
17	6	2025-10-01 07:10:24.40974
18	6	2025-10-01 07:10:24.40974
\.


--
-- Data for Name: metodos_realizados; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.metodos_realizados (id_metodo_realizado, id_metodo, id_usuario, progreso, estado, fecha_inicio, fecha_fin, fecha_creacion, fecha_actualizacion) FROM stdin;
92	1	51	20	en_progreso	2025-11-19 10:39:59.187	\N	2025-11-19 15:39:58.841384	2025-11-19 15:39:58.841384
93	2	51	60	Casi_terminando	2025-11-19 12:57:51.393	\N	2025-11-19 17:57:51.026301	2025-11-19 17:57:52.537516
94	6	51	60	Casi_terminando	2025-11-19 13:41:21.586	\N	2025-11-19 18:41:21.230464	2025-11-19 18:41:22.726539
95	1	18	20	en_progreso	2025-11-11 11:59:31	\N	2025-11-11 16:59:29	2025-11-21 16:59:29.869047
87	3	51	60	Casi_terminando	2025-11-18 23:22:29.529	\N	2025-11-19 04:22:29.626947	2025-11-19 04:22:33.411198
88	4	51	60	en_proceso	2025-11-18 23:22:45.059	\N	2025-11-19 04:22:45.159086	2025-11-19 04:22:46.451401
89	5	51	60	casi_terminando	2025-11-18 23:22:54.087	\N	2025-11-19 04:22:54.171848	2025-11-19 04:22:54.86794
\.


--
-- Data for Name: musica; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.musica (id_cancion, nombre_cancion, artista_cancion, genero_cancion, categoria_musica, id_album, fecha_creacion, fecha_actualizacion, url_musica) FROM stdin;
6	Tema 6	Anónimo	Relajante	LoFi	1	2025-10-01 14:49:26.900047	2025-10-01 14:49:26.900047	https://archivosfocus.blob.core.windows.net/lofi/Tema 6.mp3
8	Tema 8	Anónimo	Relajante	LoFi	1	2025-10-01 14:49:26.912936	2025-10-01 14:49:26.912936	https://archivosfocus.blob.core.windows.net/lofi/Tema 8.m4a
23	Tema_4	Anónimo	Instrumental	Instrumental	3	2025-11-18 20:39:55.045332	2025-11-18 20:39:55.045332	https://wqoeufdsiwftfeifduul.supabase.co/storage/v1/object/public/Musica/Relajantes/Tema%204.mp3
25	Tema_6	Anónimo	Instrumental	Instrumental	3	2025-11-18 20:39:55.045332	2025-11-18 20:39:55.045332	https://wqoeufdsiwftfeifduul.supabase.co/storage/v1/object/public/Musica/Relajantes/Tema%206.m4a
21	Tema_2	Anónimo	Instrumental	Instrumental	3	2025-11-18 20:39:55.045332	2025-11-18 20:39:55.045332	https://wqoeufdsiwftfeifduul.supabase.co/storage/v1/object/public/Musica/Relajantes/Tema%202.m4a
20	Tema_1	Anónimo	Instrumental	Instrumental	3	2025-11-18 20:39:55.045332	2025-11-18 20:39:55.045332	https://wqoeufdsiwftfeifduul.supabase.co/storage/v1/object/public/Musica/Relajantes/Tema%201.m4a
22	Tema_3	Anónimo	Instrumental	Instrumental	3	2025-11-18 20:39:55.045332	2025-11-18 20:39:55.045332	https://wqoeufdsiwftfeifduul.supabase.co/storage/v1/object/public/Musica/Relajantes/Tema%203.m4a
24	Tema_5	Anónimo	Instrumental	Instrumental	3	2025-11-18 20:39:55.045332	2025-11-18 20:39:55.045332	https://wqoeufdsiwftfeifduul.supabase.co/storage/v1/object/public/Musica/Relajantes/Tema%205.m4a
7	Tema 7	Anónimo	Relajante	LoFi	1	2025-10-01 14:49:26.918526	2025-10-01 14:49:26.918526	https://archivosfocus.blob.core.windows.net/lofi/Tema 7.m4a
10	Tema 10	Anónimo	Relajante	LoFi	1	2025-10-01 14:49:26.917747	2025-10-01 14:49:26.917747	https://archivosfocus.blob.core.windows.net/lofi/Tema 10.mp3
9	Tema 9	Anónimo	Relajante	LoFi	1	2025-10-01 14:49:26.921755	2025-10-01 14:49:26.921755	https://archivosfocus.blob.core.windows.net/lofi/Tema 9.mp3
5	Tema 5	Anónimo	Relajante	LoFi	1	2025-10-01 14:44:44.017896	2025-10-01 14:44:44.017896	https://archivosfocus.blob.core.windows.net/lofi/Tema 5.m4a
4	Tema 4	Anónimo	Relajante	LoFi	1	2025-10-01 14:43:21.839397	2025-10-01 14:43:21.839397	https://archivosfocus.blob.core.windows.net/lofi/Tema 4.mp3
3	Tema 3	Anónimo	Relajante	LoFi	1	2025-10-01 03:54:17.816413	2025-10-01 03:54:17.816413	https://archivosfocus.blob.core.windows.net/lofi/Tema 3.mp3
2	Tema 2	Anónimo	Relajante	LoFi	1	2025-10-01 03:52:56.834047	2025-10-01 03:52:56.834047	https://archivosfocus.blob.core.windows.net/lofi/Tema 2.m4a
1	Tema 1	Anónimo	Relajante	LoFi	1	2025-10-01 01:28:29.182273	2025-10-01 01:28:29.182273	https://archivosfocus.blob.core.windows.net/lofi/Tema 1.mp3
13	Cascada	Anónimo	Geofonía	Naturaleza	2	2025-10-01 15:00:46.902551	2025-10-01 15:00:46.902551	https://archivosfocus.blob.core.windows.net/naturaleza/Cascada.m4a
11	Aves	Anónimo	Geofonía	Naturaleza	2	2025-10-01 15:00:46.907608	2025-10-01 15:00:46.907608	https://archivosfocus.blob.core.windows.net/naturaleza/Aves.m4a
15	Jungla	Anónimo	Geofonía	Naturaleza	2	2025-10-01 15:00:46.920344	2025-10-01 15:00:46.920344	https://archivosfocus.blob.core.windows.net/naturaleza/Jungla.m4a
14	Fogata	Anónimo	Geofonía	Naturaleza	2	2025-10-01 15:00:46.913721	2025-10-01 15:00:46.913721	https://archivosfocus.blob.core.windows.net/naturaleza/Fogata.m4a
16	Lluvia y truenos	Anónimo	Geofonía	Naturaleza	2	2025-10-01 15:00:46.917609	2025-10-01 15:00:46.917609	https://archivosfocus.blob.core.windows.net/naturaleza/LLuvia y truenos.m4a
18	Rocas	Anónimo	Geofonía	Naturaleza	2	2025-10-01 15:00:46.923158	2025-10-01 15:00:46.923158	https://archivosfocus.blob.core.windows.net/naturaleza/Rocas.m4a
12	Bosque	Anónimo	Geofonía	Naturaleza	2	2025-10-01 15:00:46.913223	2025-10-01 15:00:46.913223	https://archivosfocus.blob.core.windows.net/naturaleza/Bosque.mp3
17	Mar	Anónimo	Geofonía	Naturaleza	2	2025-10-01 15:00:46.923622	2025-10-01 15:00:46.923622	https://archivosfocus.blob.core.windows.net/naturaleza/Mar.m4a
19	Viento	Anónimo	Geofonía	Naturaleza	2	2025-10-01 15:00:46.928963	2025-10-01 15:00:46.928963	https://archivosfocus.blob.core.windows.net/naturaleza/viento.m4a
28	Tema_9	Anónimo	Instrumental	Instrumental	3	2025-11-18 20:39:55.045332	2025-11-18 20:39:55.045332	https://wqoeufdsiwftfeifduul.supabase.co/storage/v1/object/public/Musica/Relajantes/Tema%209.mp3
27	Tema_8	Anónimo	Instrumental	Instrumental	3	2025-11-18 20:39:55.045332	2025-11-18 20:39:55.045332	https://wqoeufdsiwftfeifduul.supabase.co/storage/v1/object/public/Musica/Relajantes/Tema%208.m4a
26	Tema_7	Anónimo	Instrumental	Instrumental	3	2025-11-18 20:39:55.045332	2025-11-18 20:39:55.045332	https://wqoeufdsiwftfeifduul.supabase.co/storage/v1/object/public/Musica/Relajantes/Tema%207.mp3
29	Tema_10	Anónimo	Instrumental	Instrumental	3	2025-11-18 20:39:55.045332	2025-11-18 20:39:55.045332	https://wqoeufdsiwftfeifduul.supabase.co/storage/v1/object/public/Musica/Relajantes/Tema%2010.m4a
\.


--
-- Data for Name: notificaciones_programadas; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notificaciones_programadas (id_notificacion, id_usuario, tipo, titulo, mensaje, fecha_programada, enviada, fecha_envio) FROM stdin;
1	18	evento	Recordatorio: evento despues	Tienes un evento próximo: evento despues - evento despues	2025-11-25 10:50:00	f	\N
2	18	evento	Recordatorio: evento prueba >:v	Tienes un evento próximo: evento prueba >:v - sí	2025-11-23 10:55:00	f	\N
4	18	metodo_pendiente	Recordatorio de método pendiente	Aún tienes un método sin finalizar: Método de estudio. ¡Continúa con tu aprendizaje!	2025-11-28 16:59:29.869	f	\N
5	18	evento	Recordatorio: Wisiwasa	Tienes un evento próximo: Wisiwasa	2025-11-22 12:50:00	f	\N
6	\N	evento	Recordatorio: mañana	{"nombreEvento":"mañana","fechaEvento":"2025-11-21","horaEvento":"13:00:00","descripcionEvento":"a"}	2025-11-21 13:00:00	f	\N
7	\N	evento	Recordatorio: Prueba	{"nombreEvento":"Prueba","fechaEvento":"2025-11-27","horaEvento":"15:53:20","descripcionEvento":"Prueba","metodoEstudio":"Método Pomodoro","album":"Lofi"}	2025-11-27 15:43:20	f	\N
9	\N	evento	Recordatorio: mañana	{"nombreEvento":"mañana","fechaEvento":"2025-11-21","horaEvento":"13:00:00","descripcionEvento":"a"}	2025-11-21 13:00:00	f	\N
10	\N	evento	Recordatorio: Prueba Correo	{"nombreEvento":"Prueba Correo","fechaEvento":"2025-11-21","horaEvento":"13:00:00","descripcionEvento":"Prueba Correo"}	2025-11-21 13:00:00	f	\N
11	\N	evento	Recordatorio: Prueba	{"nombreEvento":"Prueba","fechaEvento":"2025-11-27","horaEvento":"15:53:20","descripcionEvento":"Prueba","metodoEstudio":"Método Pomodoro","album":"Lofi"}	2025-11-27 15:43:20	f	\N
12	\N	evento	Recordatorio: Prueba Correo	{"nombreEvento":"Prueba Correo","fechaEvento":"2025-11-21","horaEvento":"13:10:00","descripcionEvento":"Prueba Correo"}	2025-11-21 13:10:00	f	\N
13	\N	evento	Recordatorio: Prueba	{"nombreEvento":"Prueba","fechaEvento":"2025-11-27","horaEvento":"15:53:20","descripcionEvento":"Prueba","metodoEstudio":"Método Pomodoro","album":"Lofi"}	2025-11-27 15:43:20	f	\N
3	51	evento	Recordatorio: mañana	Tienes un evento próximo: mañana - a	2025-11-21 13:00:00	t	2025-11-21 13:12:18.469
8	51	evento	Recordatorio: Prueba Correo	Tienes un evento próximo: Prueba Correo - Prueba Correo	2025-11-21 13:10:00	t	2025-11-21 13:12:19.836
18	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:33:17.095	t	2025-11-21 14:34:06.478
14	51	evento	Recordatorio: Test Email Event	{"nombreEvento":"Test Email Event","fechaEvento":"2025-11-21","horaEvento":"13:30:00","descripcionEvento":"This is a test event to verify email notifications work"}	2025-11-21 13:30:00	t	2025-11-21 13:30:02.467
15	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
16	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
17	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
19	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
20	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
21	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
23	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
24	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
25	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
27	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
28	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
29	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
31	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
32	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
33	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
22	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:33:18.926	t	2025-11-21 14:34:09.974
26	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:33:21.861	t	2025-11-21 14:34:11.923
30	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:33:23.158	t	2025-11-21 14:34:14.435
34	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:33:25.055	t	2025-11-21 14:34:15.905
35	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
36	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
37	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
39	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
40	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
41	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
43	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
44	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
45	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
47	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
48	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
49	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
51	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
52	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
53	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
55	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
56	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
57	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
59	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
60	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
61	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
63	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
64	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
65	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
67	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
68	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
69	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
42	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:33:39.566	t	2025-11-21 14:34:20.183
46	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:36:23.098	t	2025-11-21 14:37:02.444
50	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:36:25.007	t	2025-11-21 14:37:03.936
54	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:37:04.41	t	2025-11-21 14:38:06.305
58	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:37:06.343	t	2025-11-21 14:38:09.653
62	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:37:11.442	t	2025-11-21 14:38:11.027
66	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:37:13.804	t	2025-11-21 14:38:12.573
71	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
72	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
73	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
75	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
76	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
77	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
79	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
80	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
81	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
83	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
84	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
85	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
87	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
88	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
89	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
91	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
92	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
93	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
95	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
96	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
97	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
99	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
100	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
101	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
103	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
104	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
115	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
74	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:38:26.737	t	2025-11-21 14:39:05.904
78	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:38:32.983	t	2025-11-21 14:39:08.156
82	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:38:34.876	t	2025-11-21 14:39:09.759
90	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:38:43.25	t	2025-11-21 14:39:13.794
94	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:38:52.994	t	2025-11-21 14:39:15.387
98	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:38:54.852	t	2025-11-21 14:39:16.833
102	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:39:06.008	t	2025-11-21 14:40:07.875
105	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
107	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
108	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
109	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
111	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
112	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
113	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
106	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:39:07.888	t	2025-11-21 14:40:10.565
110	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:39:15.019	t	2025-11-21 14:40:13.183
114	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:39:16.846	t	2025-11-21 14:40:14.652
116	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
117	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
119	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
120	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
121	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
123	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
124	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
125	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
127	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
128	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
129	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
131	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
132	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
133	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
135	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
136	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
137	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
139	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
140	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
141	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
143	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
144	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
145	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
147	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
148	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
149	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
122	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:39:23.874	t	2025-11-21 14:40:17.686
126	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:39:44.997	t	2025-11-21 14:40:20.001
130	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:39:46.851	t	2025-11-21 14:40:22.399
134	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:40:23.819	t	2025-11-21 14:41:02.954
138	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:40:25.611	t	2025-11-21 14:41:04.347
142	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:40:34.066	t	2025-11-21 14:41:06.116
146	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:40:35.941	t	2025-11-21 14:41:08.722
150	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:41:06.514	t	2025-11-21 14:42:02.293
151	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
152	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
153	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
155	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
156	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
157	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
159	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
160	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
161	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
163	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
164	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
165	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
167	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
168	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
169	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
171	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
172	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
173	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
175	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
176	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
177	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
179	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
180	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
181	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
183	18	evento	Recordatorio: Wisiwasa	{"nombreEvento":"Wisiwasa","fechaEvento":"2025-11-22","horaEvento":"13:00:00","descripcionEvento":null}	2025-11-22 12:50:00	f	\N
184	18	evento	Recordatorio: evento prueba >:v	{"nombreEvento":"evento prueba >:v","fechaEvento":"2025-11-24","horaEvento":"11:05:00","descripcionEvento":"sí","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-24 10:55:00	f	\N
185	18	evento	Recordatorio: evento despues	{"nombreEvento":"evento despues","fechaEvento":"2025-11-26","horaEvento":"11:00:00","descripcionEvento":"evento despues","metodoEstudio":"Repaso Espaciado","album":"Naturaleza"}	2025-11-26 10:50:00	f	\N
158	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:41:14.029	t	2025-11-21 14:42:06.659
162	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:41:16.211	t	2025-11-21 14:42:08.138
166	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:41:23.004	t	2025-11-21 14:42:09.57
170	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:41:24.833	t	2025-11-21 14:42:12.49
174	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:41:39.252	t	2025-11-21 14:42:14.012
178	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:41:41.146	t	2025-11-21 14:42:15.404
182	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:43:51.219	t	2025-11-21 14:44:02.796
187	51	evento	Recordatorio: Prueba	{"nombreEvento":"Prueba","fechaEvento":"2025-11-27","horaEvento":"15:53:20","descripcionEvento":"Prueba","metodoEstudio":"Método Pomodoro","album":"Lofi"}	2025-11-27 15:43:20	f	\N
188	51	evento	Recordatorio: Prueba	{"nombreEvento":"Prueba","fechaEvento":"2025-11-27","horaEvento":"15:53:20","descripcionEvento":"Prueba","metodoEstudio":"Método Pomodoro","album":"Lofi"}	2025-11-27 15:43:20	f	\N
189	51	evento	Recordatorio: Evento 1	{"nombreEvento":"Evento 1","fechaEvento":"2025-11-21","horaEvento":"14:00:00","descripcionEvento":"Prueba de evento"}	2025-11-21 14:00:00	t	2025-11-21 14:00:02.646
190	51	evento	Recordatorio: Evento 1	{"nombreEvento":"Evento 1","fechaEvento":"2025-11-21","horaEvento":"14:00:00","descripcionEvento":"Prueba de evento"}	2025-11-21 14:00:00	t	2025-11-21 14:00:04.201
191	51	evento	Recordatorio: Evento 1	{"nombreEvento":"Evento 1","fechaEvento":"2025-11-21","horaEvento":"14:00:00","descripcionEvento":"Prueba de evento"}	2025-11-21 14:00:00	t	2025-11-21 14:00:05.657
192	51	evento	Recordatorio: Evento 1	{"nombreEvento":"Evento 1","fechaEvento":"2025-11-21","horaEvento":"14:00:00","descripcionEvento":"Prueba de evento"}	2025-11-21 14:00:00	t	2025-11-21 14:00:06.925
193	51	evento	Recordatorio: Evento 1	{"nombreEvento":"Evento 1","fechaEvento":"2025-11-21","horaEvento":"14:00:00","descripcionEvento":"Prueba de evento"}	2025-11-21 14:00:00	t	2025-11-21 14:00:08.296
194	51	evento	Recordatorio: Evento 1	{"nombreEvento":"Evento 1","fechaEvento":"2025-11-21","horaEvento":"14:00:00","descripcionEvento":"Prueba de evento"}	2025-11-21 14:00:00	t	2025-11-21 14:00:10.081
38	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:33:37.7	t	2025-11-21 14:34:17.322
70	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:38:24.895	t	2025-11-21 14:39:03.973
86	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:38:40.985	t	2025-11-21 14:39:11.371
118	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:39:21.99	t	2025-11-21 14:40:16.103
154	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:41:08.279	t	2025-11-21 14:42:03.834
186	18	metodo_pendiente	Recordatorio de método pendiente	{"nombreMetodo":"Método Pomodoro","progreso":20,"idMetodoRealizado":95}	2025-11-21 14:43:53.041	t	2025-11-21 14:44:04.378
195	51	evento	Recordatorio: Hola	{"nombreEvento":"Hola","fechaEvento":"2025-11-25","horaEvento":"01:00:00","descripcionEvento":null}	2025-11-25 00:50:00	f	\N
\.


--
-- Data for Name: notificaciones_usuario; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notificaciones_usuario (id_usuario, eventos, metodos_pendientes, sesiones_pendientes, motivacion, fecha_actualizacion) FROM stdin;
18	t	t	t	t	2025-11-21 17:28:48.06433
51	t	t	t	t	2025-11-21 17:53:33.189116
\.


--
-- Data for Name: objetivoestudio; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.objetivoestudio (id_objetivo_estudio, nombre_objetivo, fecha_creacion, fecha_actualizacion) FROM stdin;
2	Trabajo y Productividad	2025-09-11 20:38:40.79981	2025-09-11 20:38:40.79981
3	Tareas Domésticas	2025-09-11 20:38:40.79981	2025-09-11 20:38:40.79981
4	Creatividad y Proyectos Personales	2025-09-11 20:38:40.79981	2025-09-11 20:38:40.79981
5	Salud Mental y Bienestar	2025-09-11 20:38:40.79981	2025-09-11 20:38:40.79981
1	Estudio y Aprendizaje	2025-09-11 20:38:40.79981	2025-09-17 22:21:58.357358
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.password_resets (id, user_id, code, expires_at, used, created_at) FROM stdin;
1	51	$2b$12$SYTPP6fLj2MMa2Y7Cbr7HOVa1eTwVo933bsJgiNN2In3zM5kRtyL2	2025-10-28 13:25:20.526	f	2025-10-28 18:15:19.339096
2	51	$2b$12$V5o8n3cEFqIMA6yTYdoc4O.0TNr58BkcFUoh4JeJr3bmjlBzVh3Ym	2025-10-28 13:25:44.246	t	2025-10-28 18:15:43.107613
3	51	$2b$12$KN2S8RfM89sJTvopSQ1tRuxIAnuYIGicOZSE7x3U07N35cWAWwsdS	2025-10-30 17:14:27.98	t	2025-10-30 22:04:25.352283
4	51	$2b$12$OylmuqOTMZaAV2/50ljmXuywyn65CEJ21xcCmM6dHg8rGEvu6Ogqa	2025-10-30 17:18:14.54	f	2025-10-30 22:08:11.919922
5	38	$2b$12$cuMouXv1uZPF5zmRgIFrCepeR5tu6CsdAC5nU9yIRX1H6P6BvsBnC	2025-10-30 20:15:38.123	t	2025-10-31 01:05:35.537164
7	65	$2b$12$tJTCWFH8fYa1JGkS1qq.AOBE/RIgYEkoR.6Z/3io9ksefkDJaSEm6	2025-11-12 15:03:25.777	t	2025-11-12 19:53:14.168549
8	50	$2b$12$dgsxXZPUH5xI06SwMvKkNuhfFnEUAaKJao1J0DjLSGzexwhDhpjtm	2025-11-20 17:04:20.538	t	2025-11-20 21:54:21.226986
\.


--
-- Data for Name: sesiones_concentracion; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sesiones_concentracion (id_sesion, id_usuario, titulo, descripcion, estado, tipo, id_evento, id_metodo, id_album, tiempo_transcurrido, fecha_creacion, fecha_actualizacion, ultima_interaccion) FROM stdin;
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.usuario (id_usuario, nombre_usuario, pais, genero, fecha_nacimiento, horario_fav, correo, contrasena, id_objetivo_estudio, fecha_creacion, fecha_actualizacion, token_version) FROM stdin;
50	Sebas504	Colombia	Masculino	1990-01-01	08:00:00	sebasttorrecilla797@gmail.com	$2b$12$Ad8RFwYz9BQT3YvUnxOC4.QLIeMAdGBgooof2qZ6mwbTpHXF.Ov82	\N	2025-10-24 20:01:12.015724	2025-11-20 21:56:33.265123	2
21	Juan_Diego_21	Colombia	Masculino	2006-09-21	17:00:00	jdmend@gmail.com	$2b$12$ajOF8lCMy01Jy9II4RlIV.iks77TYyfqitK8gTSYH3HqLLUOWVimy	\N	2025-09-30 20:31:02.247925	2025-09-30 20:31:02.247925	1
22	brayan_dev	Colomiba	Masculino	2000-02-12	\N	brayan@example.com	$2b$12$DrgNxrTp36O8Wr6/qBDulOphBneI6LIJA22ASEUfTre5hrf9Z0vpa	\N	2025-09-30 21:10:25.645388	2025-09-30 21:10:25.645388	1
23	johndoe12	Colombia	Masculino	1990-01-01	\N	john12@example.com	$2b$12$zR4S/5yNgx5XY5gWzbw4h.bLUbRq3.NnvZCc6rNrjzA/3/ftM9GHi	\N	2025-09-30 21:16:55.381805	2025-09-30 21:16:55.381805	1
73	Erick	Brasil	Otro	1986-07-03	08:05:00	erick@gmail.com	$2b$12$oFtEwsY2Rl6x9PcEwtxMjeFvwgwn2oYtEa9XHrk7W7CY43KJAsmHe	\N	2025-11-21 07:42:15.463851	2025-11-21 07:42:15.463851	1
25	Juan_Diego_4545	España	Otro	2006-09-21	\N	juan@gmail.com	$2b$12$Q88QNiJxbGN5RGJopc9IW.2y6fdWxartHrYv83ruZCfQueFZmMnM6	\N	2025-09-30 21:25:43.946135	2025-09-30 21:25:43.946135	1
28	Caramelo	Alemania	Prefiero no decir	1998-12-17	10:00:00	caramelo@gmail.com	$2b$12$NSGTek3.C72AzyHOF4xGM.1IoI8wLraSkch41V4xqM4ZPDsUS7z/.	\N	2025-09-30 21:41:13.842935	2025-09-30 21:41:13.842935	1
31	Natalia	Colombia	Femenino	1997-10-12	\N	nataliapmende@gmail.com	$2b$12$zeruLJzdSlAucw6FzMjRVePkRIgAnRozV6U/F742EEUfvyaR1.9i2	\N	2025-09-30 23:04:42.351377	2025-09-30 23:04:42.351377	1
32	Juan-Diego	Colombia	Masculino	1997-10-12	\N	jduan@gmail.com	$2b$12$1jRxt3qnblMOlTABAGAnUuzRt802YQIIciWkeRS0Sg4IwXAkaVb1q	\N	2025-10-01 01:36:15.991562	2025-10-01 01:36:15.991562	1
33	Alisson Vanessa	Colombia	Femenino	2006-05-17	08:00:00	alisson@gmail.com	$2b$12$tZcVw9FiPLyixz0UoN47g.ZRbc8q/FgA5SkpvkilkH5NadZDbnL6C	\N	2025-10-01 01:58:48.000229	2025-10-01 01:59:52.026418	1
37	pruebas2v	\N	Masculino	2000-05-15	\N	brayan222@example.com	$2b$12$4MG.Z8yt1opnyT8Z1gW9j.BC5wprUG2m7t2b1GWmn1cWAn0g3nVdS	\N	2025-10-01 04:13:26.605955	2025-10-01 04:13:26.605955	1
64	www	Colombia	Femenino	2006-09-21	18:30:00	nwata@gmail.com	$2b$12$3a8v9IpcWvooewyP9yZNGu3XUa/FLiWt5ZlQ.Xh3VD3FGTNIGyWPS	\N	2025-11-12 00:15:55.842176	2025-11-12 00:15:55.842176	1
42	brayandev1234	Colombia	Masculino	2002-02-02	02:12:00	bjuan8528@gmail.com	$2b$12$TNgJQdY6rH9PgryLuQA6J.Lh9tb6ZXV3znH4GS0KJxiRo/3NPf2RG	\N	2025-10-20 20:35:55.58123	2025-10-20 20:35:55.58123	1
44	brayandev123422	Colombia	Masculino	2002-02-02	02:12:00	bjuan8522228@gmail.com	$2b$12$YvFCEn2mH0rLYzK.wtk1Ce5FaGi5UHmImoW6grklxLdcNAwaOBNri	\N	2025-10-20 20:42:53.178342	2025-10-20 20:42:53.178342	1
46	nuevousuario2	Colombia	Masculino	2002-02-12	14:11:00	brodriguez2001@gmail.com	$2b$12$ctA9Ye3Us3j1pi978yPkNe73C1FMZJhKk7QwpI.OtlvKmgDdld4l2	\N	2025-10-20 20:44:49.097729	2025-10-20 20:44:49.097729	1
18	johndoe	Italia	Masculino	1990-01-01	08:00:00	john@example.com	$2b$12$htfSv2gnjBXG8JvUjjjG9O3dMPXs6F7xoHzYaFUC93nILgbs9DNyy	\N	2025-09-30 18:54:15.194036	2025-11-21 16:59:13.260505	25
40	pruebas2vs	\N	Masculino	2000-05-15	\N	brayan2s22@example.com	$2b$12$eI21Jd2KUvs/I25cokiax.yu2yI9RTBjJ.VBhvcdVisy6GWkGYb1e	\N	2025-10-16 17:16:46.175863	2025-10-16 17:16:46.175863	1
47	nuevousuario3	Colombia	Masculino	2002-02-02	14:02:00	brodriguez20012@gmail.com	$2b$12$UfR5ZZNfX5yF6m9Lw4OdsOIP0FfZ2ZS7TiEHvUtafCMmHlo3B2FNa	\N	2025-10-20 20:47:54.573566	2025-10-20 20:47:54.573566	1
48	Dev1	Colombia	Masculino	2002-02-02	14:22:00	prueba1@gmail.com	$2b$12$6HqqNRLzcyEuV0EQ035uIu7us6waX2Q.9faaV5vGjNYelbH2ASloS	\N	2025-10-24 19:27:53.073435	2025-10-24 19:27:53.073435	1
49	Dev2	Colombia	Masculino	0002-02-02	14:22:00	prueba2@gmail.com	$2b$12$v/dxK2FWEQ9HTl0e95ODvO7Ayyh/SKjNXm5vrca0q1mtBQEMy/OXq	\N	2025-10-24 19:35:32.680541	2025-10-24 19:35:32.680541	1
41	brayan_dev2	\N	Masculino	2000-05-15	\N	brodriguez20071@gmail.com	$2b$12$K6X6cPcAqFitH723nZVkyuLfHqI6hmTB2NAiA4RBjejRVVGrOkiPy	\N	2025-10-16 17:17:11.889616	2025-10-24 19:46:38.587611	1
51	JuanDiego	Colombia	Masculino	2006-09-21	18:30:00	jdmend21@gmail.com	$2b$12$f02qW.6dZcyJRGVGCh.nLujiPfuvRT2aF.D2sjmFjAogYzltfnrX.	\N	2025-10-28 16:09:55.47511	2025-11-21 18:51:39.556629	24
54	testuser	\N	\N	1990-01-01	\N	test@example.com	$2b$12$cNPpQdPbh/wfp0ZIcfrrXuDMq6j8T.szrLyUid54/1AKiLLLD0feG	\N	2025-10-28 19:59:45.80312	2025-10-28 19:59:45.80312	1
55	Natat	Colombia	Femenino	1990-01-01	08:00:00	natalia@example.com	$2b$12$R5/YOu2BHl5FVG.uXS5azeFu4E5OTiPpMYlaaE8hu/U2xDu7aquM6	\N	2025-10-28 20:03:59.902521	2025-10-28 20:03:59.902521	1
38	Namendez	Colombia	Femenino	1997-10-12	08:12:00	nataliapmendez12@gmail.com	$2b$12$qAYP27VCgVEFFxi195Y.qetnDrrb092iqydFkvXMH/gVkvBiDnphi	\N	2025-10-01 16:10:39.0418	2025-10-31 01:06:30.415968	1
62	Natalia_333	Colombia	Femenino	2006-09-21	16:00:00	nata@gmail.com	$2b$12$iQ99cW1Wknte4WbYfzwZ.e4ObXUpcfXfmi6M.OQNPmhvD4qGf/SYC	\N	2025-11-11 20:58:57.244052	2025-11-11 20:58:57.244052	1
65	Señorita	Colombia	Femenino	2002-03-17	04:00:00	rosajmirandar@gmail.com	$2b$12$gftkhTqT/wteoU7mSQHz3OhAekkJJueZ66Z1KyofSnKvZ7rnP8Aza	\N	2025-11-12 19:52:59.617016	2025-11-12 19:55:09.865017	1
67	Test Feynman User	Colombia	Masculino	1989-12-31	\N	test-feynman@example.com	hashedpassword	\N	2025-11-17 22:06:24.043608	2025-11-17 22:06:24.043608	1
\.


--
-- Data for Name: usuariodistracciones; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.usuariodistracciones (id_usuario, id_distraccion, fecha_creacion) FROM stdin;
18	1	2025-09-30 18:54:15.194036
18	2	2025-09-30 18:54:15.194036
21	1	2025-09-30 20:31:02.247925
21	2	2025-09-30 20:31:02.247925
28	6	2025-09-30 21:41:13.842935
28	8	2025-09-30 21:41:13.842935
33	1	2025-10-01 01:58:48.000229
33	2	2025-10-01 01:58:48.000229
38	5	2025-10-01 16:10:39.0418
38	8	2025-10-01 16:10:39.0418
42	8	2025-10-20 20:35:55.58123
42	13	2025-10-20 20:35:55.58123
44	3	2025-10-20 20:42:53.178342
44	12	2025-10-20 20:42:53.178342
46	2	2025-10-20 20:44:49.097729
46	3	2025-10-20 20:44:49.097729
47	1	2025-10-20 20:47:54.573566
47	2	2025-10-20 20:47:54.573566
48	1	2025-10-24 19:27:53.073435
48	2	2025-10-24 19:27:53.073435
49	1	2025-10-24 19:35:32.680541
49	2	2025-10-24 19:35:32.680541
50	1	2025-10-24 20:01:12.015724
50	2	2025-10-24 20:01:12.015724
51	1	2025-10-28 16:09:55.47511
51	2	2025-10-28 16:09:55.47511
55	1	2025-10-28 20:03:59.902521
55	2	2025-10-28 20:03:59.902521
62	1	2025-11-11 20:58:57.244052
62	2	2025-11-11 20:58:57.244052
64	1	2025-11-12 00:15:55.842176
64	3	2025-11-12 00:15:55.842176
65	5	2025-11-12 19:52:59.617016
65	11	2025-11-12 19:52:59.617016
73	5	2025-11-21 07:42:15.463851
73	1	2025-11-21 07:42:15.463851
\.


--
-- Data for Name: usuariointereses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.usuariointereses (id_usuario, id_interes, fecha_creacion) FROM stdin;
18	1	2025-09-30 18:54:15.194036
18	2	2025-09-30 18:54:15.194036
18	3	2025-09-30 18:54:15.194036
21	1	2025-09-30 20:31:02.247925
21	2	2025-09-30 20:31:02.247925
21	3	2025-09-30 20:31:02.247925
28	1	2025-09-30 21:41:13.842935
28	2	2025-09-30 21:41:13.842935
28	3	2025-09-30 21:41:13.842935
33	1	2025-10-01 01:58:48.000229
33	2	2025-10-01 01:58:48.000229
33	3	2025-10-01 01:58:48.000229
38	1	2025-10-01 16:10:39.0418
38	2	2025-10-01 16:10:39.0418
38	3	2025-10-01 16:10:39.0418
42	1	2025-10-20 20:35:55.58123
42	2	2025-10-20 20:35:55.58123
42	3	2025-10-20 20:35:55.58123
44	1	2025-10-20 20:42:53.178342
44	2	2025-10-20 20:42:53.178342
44	3	2025-10-20 20:42:53.178342
46	1	2025-10-20 20:44:49.097729
46	2	2025-10-20 20:44:49.097729
46	3	2025-10-20 20:44:49.097729
47	1	2025-10-20 20:47:54.573566
47	2	2025-10-20 20:47:54.573566
47	3	2025-10-20 20:47:54.573566
48	1	2025-10-24 19:27:53.073435
48	2	2025-10-24 19:27:53.073435
48	3	2025-10-24 19:27:53.073435
49	1	2025-10-24 19:35:32.680541
49	2	2025-10-24 19:35:32.680541
49	3	2025-10-24 19:35:32.680541
50	1	2025-10-24 20:01:12.015724
50	2	2025-10-24 20:01:12.015724
50	3	2025-10-24 20:01:12.015724
51	1	2025-10-28 16:09:55.47511
51	2	2025-10-28 16:09:55.47511
51	3	2025-10-28 16:09:55.47511
55	1	2025-10-28 20:03:59.902521
55	2	2025-10-28 20:03:59.902521
55	3	2025-10-28 20:03:59.902521
62	1	2025-11-11 20:58:57.244052
62	2	2025-11-11 20:58:57.244052
62	3	2025-11-11 20:58:57.244052
64	1	2025-11-12 00:15:55.842176
64	2	2025-11-12 00:15:55.842176
64	3	2025-11-12 00:15:55.842176
65	1	2025-11-12 19:52:59.617016
65	2	2025-11-12 19:52:59.617016
65	3	2025-11-12 19:52:59.617016
73	1	2025-11-21 07:42:15.463851
73	2	2025-11-21 07:42:15.463851
73	3	2025-11-21 07:42:15.463851
\.


--
-- Name: albummusica_id_album_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.albummusica_id_album_seq', 3, true);


--
-- Name: alertas_id_alerta_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.alertas_id_alerta_seq', 1, false);


--
-- Name: aplicacionesrestringidas_id_aplicacion_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.aplicacionesrestringidas_id_aplicacion_seq', 1, false);


--
-- Name: beneficios_id_beneficio_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.beneficios_id_beneficio_seq', 14, true);


--
-- Name: bibliotecametodosestudio_id_metodo_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bibliotecametodosestudio_id_metodo_seq', 1, true);


--
-- Name: configuracion_sistema_id_config_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.configuracion_sistema_id_config_seq', 1, true);


--
-- Name: distracciones_id_distraccion_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.distracciones_id_distraccion_seq', 20, true);


--
-- Name: eventos_id_evento_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.eventos_id_evento_seq', 33, true);


--
-- Name: intereses_id_interes_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.intereses_id_interes_seq', 8, true);


--
-- Name: metodos_realizados_id_metodo_realizado_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.metodos_realizados_id_metodo_realizado_seq', 95, true);


--
-- Name: musica_id_cancion_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.musica_id_cancion_seq', 29, true);


--
-- Name: notificaciones_programadas_id_notificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.notificaciones_programadas_id_notificacion_seq', 195, true);


--
-- Name: objetivoestudio_id_objetivo_estudio_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.objetivoestudio_id_objetivo_estudio_seq', 5, true);


--
-- Name: password_resets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.password_resets_id_seq', 8, true);


--
-- Name: sesiones_concentracion_id_sesion_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sesiones_concentracion_id_sesion_seq', 1, false);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 73, true);


--
-- Name: users_sync users_sync_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neondb_owner
--

ALTER TABLE ONLY neon_auth.users_sync
    ADD CONSTRAINT users_sync_pkey PRIMARY KEY (id);


--
-- Name: albummusica albummusica_nombre_album_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.albummusica
    ADD CONSTRAINT albummusica_nombre_album_key UNIQUE (nombre_album);


--
-- Name: albummusica albummusica_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.albummusica
    ADD CONSTRAINT albummusica_pkey PRIMARY KEY (id_album);


--
-- Name: alertas alertas_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_pkey PRIMARY KEY (id_alerta);


--
-- Name: aplicacionesrestringidas aplicacionesrestringidas_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.aplicacionesrestringidas
    ADD CONSTRAINT aplicacionesrestringidas_pkey PRIMARY KEY (id_aplicacion);


--
-- Name: beneficios beneficios_descripcion_beneficio_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.beneficios
    ADD CONSTRAINT beneficios_descripcion_beneficio_key UNIQUE (descripcion_beneficio);


--
-- Name: beneficios beneficios_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.beneficios
    ADD CONSTRAINT beneficios_pkey PRIMARY KEY (id_beneficio);


--
-- Name: bibliotecametodosestudio bibliotecametodosestudio_nombre_metodo_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bibliotecametodosestudio
    ADD CONSTRAINT bibliotecametodosestudio_nombre_metodo_key UNIQUE (nombre_metodo);


--
-- Name: bibliotecametodosestudio bibliotecametodosestudio_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bibliotecametodosestudio
    ADD CONSTRAINT bibliotecametodosestudio_pkey PRIMARY KEY (id_metodo);


--
-- Name: configuracion_sistema configuracion_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (id_config);


--
-- Name: distracciones distracciones_nombre_distraccion_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.distracciones
    ADD CONSTRAINT distracciones_nombre_distraccion_key UNIQUE (nombre_distraccion);


--
-- Name: distracciones distracciones_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.distracciones
    ADD CONSTRAINT distracciones_pkey PRIMARY KEY (id_distraccion);


--
-- Name: eventos eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_pkey PRIMARY KEY (id_evento);


--
-- Name: intereses intereses_nombre_interes_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.intereses
    ADD CONSTRAINT intereses_nombre_interes_key UNIQUE (nombre_interes);


--
-- Name: intereses intereses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.intereses
    ADD CONSTRAINT intereses_pkey PRIMARY KEY (id_interes);


--
-- Name: metodobeneficios metodobeneficios_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.metodobeneficios
    ADD CONSTRAINT metodobeneficios_pkey PRIMARY KEY (id_beneficio, id_metodo);


--
-- Name: metodos_realizados metodos_realizados_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.metodos_realizados
    ADD CONSTRAINT metodos_realizados_pkey PRIMARY KEY (id_metodo_realizado);


--
-- Name: musica musica_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.musica
    ADD CONSTRAINT musica_pkey PRIMARY KEY (id_cancion);


--
-- Name: notificaciones_programadas notificaciones_programadas_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notificaciones_programadas
    ADD CONSTRAINT notificaciones_programadas_pkey PRIMARY KEY (id_notificacion);


--
-- Name: notificaciones_usuario notificaciones_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notificaciones_usuario
    ADD CONSTRAINT notificaciones_usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: objetivoestudio objetivoestudio_nombre_objetivo_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.objetivoestudio
    ADD CONSTRAINT objetivoestudio_nombre_objetivo_key UNIQUE (nombre_objetivo);


--
-- Name: objetivoestudio objetivoestudio_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.objetivoestudio
    ADD CONSTRAINT objetivoestudio_pkey PRIMARY KEY (id_objetivo_estudio);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: sesiones_concentracion sesiones_concentracion_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sesiones_concentracion
    ADD CONSTRAINT sesiones_concentracion_pkey PRIMARY KEY (id_sesion);


--
-- Name: usuario usuario_correo_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_correo_key UNIQUE (correo);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: usuariodistracciones usuariodistracciones_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.usuariodistracciones
    ADD CONSTRAINT usuariodistracciones_pkey PRIMARY KEY (id_usuario, id_distraccion);


--
-- Name: usuariointereses usuariointereses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.usuariointereses
    ADD CONSTRAINT usuariointereses_pkey PRIMARY KEY (id_usuario, id_interes);


--
-- Name: users_sync_deleted_at_idx; Type: INDEX; Schema: neon_auth; Owner: neondb_owner
--

CREATE INDEX users_sync_deleted_at_idx ON neon_auth.users_sync USING btree (deleted_at);


--
-- Name: idx_alertas_sesion; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_alertas_sesion ON public.alertas USING btree (id_sesion);


--
-- Name: idx_eventos_fecha; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_eventos_fecha ON public.eventos USING btree (fecha_evento);


--
-- Name: idx_eventos_usuario; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_eventos_usuario ON public.eventos USING btree (id_usuario);


--
-- Name: idx_usuario_correo; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_usuario_correo ON public.usuario USING btree (correo);


--
-- Name: idx_usuario_objetivo; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_usuario_objetivo ON public.usuario USING btree (id_objetivo_estudio);


--
-- Name: idx_usuario_token_version; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_usuario_token_version ON public.usuario USING btree (token_version);


--
-- Name: eventos trigger_actualizar_eventos; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trigger_actualizar_eventos BEFORE UPDATE ON public.eventos FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: sesiones_concentracion trigger_actualizar_sesiones_concentracion; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trigger_actualizar_sesiones_concentracion BEFORE UPDATE ON public.sesiones_concentracion FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: usuario trigger_actualizar_usuario; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trigger_actualizar_usuario BEFORE UPDATE ON public.usuario FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: aplicacionesrestringidas aplicacionesrestringidas_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.aplicacionesrestringidas
    ADD CONSTRAINT aplicacionesrestringidas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: eventos eventos_id_metodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_id_metodo_fkey FOREIGN KEY (id_metodo) REFERENCES public.bibliotecametodosestudio(id_metodo) ON DELETE SET NULL;


--
-- Name: eventos eventos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: eventos fk_evento_album; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT fk_evento_album FOREIGN KEY (id_album) REFERENCES public.albummusica(id_album);


--
-- Name: metodobeneficios metodobeneficios_id_beneficio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.metodobeneficios
    ADD CONSTRAINT metodobeneficios_id_beneficio_fkey FOREIGN KEY (id_beneficio) REFERENCES public.beneficios(id_beneficio) ON DELETE CASCADE;


--
-- Name: metodobeneficios metodobeneficios_id_metodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.metodobeneficios
    ADD CONSTRAINT metodobeneficios_id_metodo_fkey FOREIGN KEY (id_metodo) REFERENCES public.bibliotecametodosestudio(id_metodo) ON DELETE CASCADE;


--
-- Name: musica musica_id_album_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.musica
    ADD CONSTRAINT musica_id_album_fkey FOREIGN KEY (id_album) REFERENCES public.albummusica(id_album) ON DELETE SET NULL;


--
-- Name: notificaciones_programadas notificaciones_programadas_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notificaciones_programadas
    ADD CONSTRAINT notificaciones_programadas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: notificaciones_usuario notificaciones_usuario_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notificaciones_usuario
    ADD CONSTRAINT notificaciones_usuario_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: sesiones_concentracion sesiones_concentracion_id_album_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sesiones_concentracion
    ADD CONSTRAINT sesiones_concentracion_id_album_fkey FOREIGN KEY (id_album) REFERENCES public.albummusica(id_album) ON DELETE SET NULL;


--
-- Name: sesiones_concentracion sesiones_concentracion_id_evento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sesiones_concentracion
    ADD CONSTRAINT sesiones_concentracion_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.eventos(id_evento) ON DELETE SET NULL;


--
-- Name: sesiones_concentracion sesiones_concentracion_id_metodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sesiones_concentracion
    ADD CONSTRAINT sesiones_concentracion_id_metodo_fkey FOREIGN KEY (id_metodo) REFERENCES public.bibliotecametodosestudio(id_metodo) ON DELETE SET NULL;


--
-- Name: sesiones_concentracion sesiones_concentracion_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sesiones_concentracion
    ADD CONSTRAINT sesiones_concentracion_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: usuario usuario_id_objetivo_estudio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_id_objetivo_estudio_fkey FOREIGN KEY (id_objetivo_estudio) REFERENCES public.objetivoestudio(id_objetivo_estudio);


--
-- Name: usuariodistracciones usuariodistracciones_id_distraccion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.usuariodistracciones
    ADD CONSTRAINT usuariodistracciones_id_distraccion_fkey FOREIGN KEY (id_distraccion) REFERENCES public.distracciones(id_distraccion) ON DELETE CASCADE;


--
-- Name: usuariodistracciones usuariodistracciones_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.usuariodistracciones
    ADD CONSTRAINT usuariodistracciones_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: usuariointereses usuariointereses_id_interes_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.usuariointereses
    ADD CONSTRAINT usuariointereses_id_interes_fkey FOREIGN KEY (id_interes) REFERENCES public.intereses(id_interes) ON DELETE CASCADE;


--
-- Name: usuariointereses usuariointereses_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.usuariointereses
    ADD CONSTRAINT usuariointereses_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO mr_focus_app;


--
-- Name: TABLE albummusica; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.albummusica TO mr_focus_app;


--
-- Name: SEQUENCE albummusica_id_album_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.albummusica_id_album_seq TO mr_focus_app;


--
-- Name: TABLE alertas; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.alertas TO mr_focus_app;


--
-- Name: SEQUENCE alertas_id_alerta_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.alertas_id_alerta_seq TO mr_focus_app;


--
-- Name: TABLE aplicacionesrestringidas; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.aplicacionesrestringidas TO mr_focus_app;


--
-- Name: SEQUENCE aplicacionesrestringidas_id_aplicacion_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.aplicacionesrestringidas_id_aplicacion_seq TO mr_focus_app;


--
-- Name: TABLE beneficios; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.beneficios TO mr_focus_app;


--
-- Name: SEQUENCE beneficios_id_beneficio_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.beneficios_id_beneficio_seq TO mr_focus_app;


--
-- Name: TABLE bibliotecametodosestudio; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.bibliotecametodosestudio TO mr_focus_app;


--
-- Name: SEQUENCE bibliotecametodosestudio_id_metodo_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.bibliotecametodosestudio_id_metodo_seq TO mr_focus_app;


--
-- Name: TABLE distracciones; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.distracciones TO mr_focus_app;


--
-- Name: SEQUENCE distracciones_id_distraccion_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.distracciones_id_distraccion_seq TO mr_focus_app;


--
-- Name: TABLE eventos; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.eventos TO mr_focus_app;


--
-- Name: SEQUENCE eventos_id_evento_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.eventos_id_evento_seq TO mr_focus_app;


--
-- Name: TABLE intereses; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.intereses TO mr_focus_app;


--
-- Name: SEQUENCE intereses_id_interes_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.intereses_id_interes_seq TO mr_focus_app;


--
-- Name: TABLE metodobeneficios; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.metodobeneficios TO mr_focus_app;


--
-- Name: TABLE musica; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.musica TO mr_focus_app;


--
-- Name: SEQUENCE musica_id_cancion_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.musica_id_cancion_seq TO mr_focus_app;


--
-- Name: TABLE objetivoestudio; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.objetivoestudio TO mr_focus_app;


--
-- Name: SEQUENCE objetivoestudio_id_objetivo_estudio_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.objetivoestudio_id_objetivo_estudio_seq TO mr_focus_app;


--
-- Name: TABLE usuario; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.usuario TO mr_focus_app;


--
-- Name: SEQUENCE usuario_id_usuario_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.usuario_id_usuario_seq TO mr_focus_app;


--
-- Name: TABLE usuariodistracciones; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.usuariodistracciones TO mr_focus_app;


--
-- Name: TABLE usuariointereses; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.usuariointereses TO mr_focus_app;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

