import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1700161061935 implements MigrationInterface {
    name = 'Migration1700161061935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" ADD "password" character varying(300) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "password"`);
    }

}
