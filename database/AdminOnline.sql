-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

-- DROP SEQUENCE public.barang_id_seq;

CREATE SEQUENCE public.barang_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.kategori_id_seq;

CREATE SEQUENCE public.kategori_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.login_id_seq;

CREATE SEQUENCE public.login_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;-- public.kategori definition

-- Drop table

-- DROP TABLE public.kategori;

CREATE TABLE public.kategori (
	id int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	nama_kategori text NULL,
	CONSTRAINT kategori_pkey PRIMARY KEY (id)
);


-- public.login definition

-- Drop table

-- DROP TABLE public.login;

CREATE TABLE public.login (
	id int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	username text NULL,
	"password" text NULL,
	CONSTRAINT login_pkey PRIMARY KEY (id)
);


-- public.barang definition

-- Drop table

-- DROP TABLE public.barang;

CREATE TABLE public.barang (
	id int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	nama_barang text NULL,
	harga int8 NULL,
	deskripsi text NULL,
	id_kategori int8 NULL,
	foto text NULL,
	CONSTRAINT barang_pkey PRIMARY KEY (id),
	CONSTRAINT barang_id_kategori_fkey FOREIGN KEY (id_kategori) REFERENCES public.kategori(id)
);


