import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1700006112396 implements MigrationInterface {
    name = 'Migration1700006112396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "userName" text NOT NULL, "phoneNumber" character varying(20) NOT NULL, "password" character varying(300) NOT NULL, "access_token" character varying, "photo" text, "address" text, "birthdate" character varying, "temp_phone" character varying(20), "gender" "public"."users_gender_enum" NOT NULL DEFAULT 'male', "isverify" boolean NOT NULL DEFAULT false, "isDeleted" boolean NOT NULL DEFAULT false, "smscode" integer, "reset_code" integer, CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293" UNIQUE ("phoneNumber"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."accounts_visatype_enum" AS ENUM('visa', 'mastercard')`);
        await queryRunner.query(`CREATE TABLE "accounts" ("id" SERIAL NOT NULL, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "cardNumber" bigint NOT NULL, "cvv" integer NOT NULL, "expiryDate" character varying NOT NULL, "visaType" "public"."accounts_visatype_enum" NOT NULL DEFAULT 'visa', "isDeleted" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_0970d734432e6704d429809f55b" UNIQUE ("cardNumber"), CONSTRAINT "UQ_6019e1e9d4420c594dc5408eb6d" UNIQUE ("expiryDate"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP TYPE "public"."accounts_visatype_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
    }

}
