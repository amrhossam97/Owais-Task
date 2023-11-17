import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1700153892924 implements MigrationInterface {
    name = 'Migration1700153892924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" ADD "balance" numeric NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "balance"`);
    }

}
