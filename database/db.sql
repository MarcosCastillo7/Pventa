

 //////
 Create database database_links;
use database_links;

Create table users(
    id int(11) not null,
    username varchar(20) not null,
    password varchar(60) not null,
    fullname varchar(20) not null
);

alter table users
 ADD PRIMARY KEY (id);

 alter table users
 modify id int(11) not null auto_increment;

 Create table links (
     id int(11) not null PRIMARY key auto_increment,
     title varchar(150) not null,
     url varchar(255) not null,
     unidades int,
       Precio_costo int,
     Precio_venta int,
     description text,
     user_id int(11),
     created_at timestamp not null default current_timestamp,
     constraint fk_user foreign key (user_id) references users(id)
     );
 
 
 Create table ventas (
     id int(11) not null PRIMARY key auto_increment,
     cliente varchar(150) not null,
     cantidad varchar(255) not null,
     description text,
     user_id int(11),
     created_at timestamp not null default current_timestamp,
     constraint fk_user2 foreign key (user_id) references users(id)
     );
 